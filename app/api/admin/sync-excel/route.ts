import { NextResponse } from 'next/server';
import { verifyStaff } from '@/lib/auth-utils';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSyncTarget, getValidAccessToken } from '@/lib/graph-auth';
import {
  REQUIRED_COLUMNS,
  classifyPair,
  findColumnIndexes,
  normalizeExcelStatus,
  normalizeNotes,
  ownedTupleFromDb,
  ownedTupleFromExcel,
  parseDeposit,
  toExcelStatus,
  tupleHash,
} from '@/lib/excel-sync';

export const runtime = 'nodejs';

function columnLetter(i: number): string {
  let n = i + 1;
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function getCell(row: any[], idx: number | undefined): unknown {
  if (idx == null) return null;
  return row[idx] ?? null;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function graphJson(url: string, token: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { ok: res.ok, status: res.status, json };
}

export async function POST() {
  const staff = await verifyStaff();
  if (!staff.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth = await getValidAccessToken();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 400 });
  }
  const target = await getSyncTarget();
  if ('error' in target) {
    return NextResponse.json({ error: target.error }, { status: 400 });
  }

  const { token } = auth;
  const { itemId, worksheet } = target;

  const base = `https://graph.microsoft.com/v1.0/me/drive/items/${encodeURIComponent(itemId)}/workbook/worksheets('${encodeURIComponent(worksheet)}')`;

  const used = await graphJson(`${base}/usedRange?$select=values`, token);
  if (!used.ok) {
    return NextResponse.json({ error: 'graph_read_failed', status: used.status, detail: used.json }, { status: 502 });
  }

  const values: any[][] = Array.isArray(used.json?.values) ? used.json.values : [];
  if (values.length === 0) {
    return NextResponse.json({ error: 'sheet_missing_columns', missing: REQUIRED_COLUMNS }, { status: 400 });
  }

  const headers = (values[0] || []).map((v: any) => String(v ?? ''));
  const idx = findColumnIndexes(headers);
  const missing = REQUIRED_COLUMNS.filter((c) => idx[c] == null);
  if (missing.length > 0) {
    return NextResponse.json({ error: 'sheet_missing_columns', missing }, { status: 400 });
  }

  const idIdx = idx['id']!;
  const statusIdx = idx['status']!;
  const depositIdx = idx['deposit']!;
  const notesIdx = idx['notes']!;

  const [{ data: roomsData }, { data: bookingsData, error: bookingsError }] = await Promise.all([
    supabaseAdmin.from('rooms').select('id,title'),
    supabaseAdmin.from('bookings').select('id,room_id,unit_name,guest_name,guest_email,check_in,check_out,check_in_time,check_out_time,total_price,package_name,units_count,payment_status,created_at,amount_paid,admin_notes,excel_row_ref,excel_hash,excel_synced_at'),
  ]);
  if (bookingsError) {
    return NextResponse.json({ error: 'db_read_failed', detail: bookingsError.message }, { status: 500 });
  }

  const roomsMap = new Map<number, string>();
  for (const r of roomsData || []) roomsMap.set(Number(r.id), String(r.title || ''));

  const bookings = (bookingsData || []) as any[];
  const byId = new Map<number, any>();
  for (const b of bookings) byId.set(Number(b.id), b);

  const warnings: Array<{ row: number; reason: string; id?: unknown }> = [];
  const errors: Array<{ bookingId?: number; step: string; reason: string }> = [];
  let pushed = 0;
  let pulled = 0;
  let conflicts = 0;

  // Map excel row number -> row values (1-based in sheet, values[0] is header => row 1)
  const excelByBookingId = new Map<number, { rowNum: number; row: any[] }>();
  for (let i = 1; i < values.length; i++) {
    const row = values[i] || [];
    const rawId = getCell(row, idIdx);
    if (rawId == null || rawId === '') continue;
    const idNum = Number(rawId);
    if (!Number.isFinite(idNum) || !Number.isInteger(idNum)) {
      warnings.push({ row: i + 1, reason: 'invalid_id', id: rawId });
      continue;
    }
    if (!byId.has(idNum)) {
      warnings.push({ row: i + 1, reason: 'id_not_in_db', id: idNum });
      continue;
    }
    excelByBookingId.set(idNum, { rowNum: i + 1, row });
  }

  // Track current extent locally for appends
  let extent = values.length; // number of rows currently in values (incl header)

  const canonicalCols = ['id', 'guest', 'phone', 'unit', 'room', 'check-in', 'check-out', 'package', 'units', 'total', 'status', 'deposit', 'notes', 'created'];

  // 6. Push appends
  for (const b of bookings.filter((x) => x.excel_row_ref == null)) {
    const targetRow = extent + 1; // append after current used range
    const roomTitle = roomsMap.get(Number(b.room_id)) || '';
    const rowVals = [
      b.id,
      b.guest_name ?? '',
      b.guest_email ?? '',
      b.unit_name ?? '',
      roomTitle,
      b.check_in ?? '',
      b.check_out ?? '',
      b.package_name ?? '',
      b.units_count ?? '',
      b.total_price ?? '',
      toExcelStatus(String(b.payment_status || 'pending')),
      b.amount_paid ?? 0,
      b.admin_notes ?? '',
      b.created_at ?? '',
    ];
    const address = `A${targetRow}:${columnLetter(canonicalCols.length - 1)}${targetRow}`;
    const patch = await graphJson(`${base}/range(address='${address}')`, token, {
      method: 'PATCH',
      body: JSON.stringify({ values: [rowVals] }),
    });
    if (!patch.ok) {
      errors.push({ bookingId: b.id, step: 'append', reason: String(patch.status) });
      continue;
    }
    const dbTuple = ownedTupleFromDb({
      payment_status: b.payment_status ?? null,
      admin_notes: b.admin_notes ?? null,
      amount_paid: b.amount_paid != null ? Number(b.amount_paid) : null,
    });
    await supabaseAdmin.from('bookings').update({
      excel_row_ref: targetRow,
      excel_synced_at: new Date().toISOString(),
      excel_hash: tupleHash(dbTuple),
    }).eq('id', b.id);
    b.excel_row_ref = targetRow;
    b.excel_hash = tupleHash(dbTuple);
    b.excel_synced_at = new Date().toISOString();
    extent += 1;
    pushed += 1;
  }

  // Helper to read current excel owned tuple for a booking
  function excelTupleFor(b: any): { tuple: ReturnType<typeof ownedTupleFromDb> | null; raw: { status: unknown; deposit: unknown; notes: unknown } | null } {
    const ex = excelByBookingId.get(Number(b.id));
    if (!ex) return { tuple: null, raw: null };
    const raw = {
      status: getCell(ex.row, statusIdx),
      deposit: getCell(ex.row, depositIdx),
      notes: getCell(ex.row, notesIdx),
    };
    const tuple = ownedTupleFromExcel(raw.status, raw.notes, raw.deposit);
    return { tuple, raw };
  }

  // 7. Push db-only updates for matched bookings
  for (const b of bookings.filter((x) => x.excel_row_ref != null)) {
    const ex = excelByBookingId.get(Number(b.id));
    if (!ex) continue; // row not present in sheet now; skip
    const dbTuple = ownedTupleFromDb({
      payment_status: b.payment_status ?? null,
      admin_notes: b.admin_notes ?? null,
      amount_paid: b.amount_paid != null ? Number(b.amount_paid) : null,
    });
    const dbHash = tupleHash(dbTuple);
    const { tuple: exTuple } = excelTupleFor(b);
    if (!exTuple) continue; // invalid excel owned tuple; don't classify as db-only push
    const excelHash = tupleHash(exTuple);
    const pair = classifyPair(dbHash, excelHash, b.excel_hash ?? null);
    if (pair !== 'db-only') continue;

    const rowNum = ex.rowNum;
    const updates = [
      { col: statusIdx, value: toExcelStatus(String(b.payment_status || 'pending')) },
      { col: depositIdx, value: b.amount_paid ?? 0 },
      { col: notesIdx, value: b.admin_notes ?? '' },
    ];
    let ok = true;
    for (const u of updates) {
      const addr = `${columnLetter(u.col)}${rowNum}`;
      const patch = await graphJson(`${base}/range(address='${addr}:${addr}')`, token, {
        method: 'PATCH',
        body: JSON.stringify({ values: [[u.value]] }),
      });
      if (!patch.ok) { ok = false; errors.push({ bookingId: b.id, step: 'db-only-push', reason: String(patch.status) }); break; }
    }
    if (ok) {
      await supabaseAdmin.from('bookings').update({
        excel_hash: dbHash,
        excel_synced_at: new Date().toISOString(),
      }).eq('id', b.id);
      b.excel_hash = dbHash;
      b.excel_synced_at = new Date().toISOString();
    }
  }

  // 8. Pull
  for (const b of bookings.filter((x) => x.excel_row_ref != null)) {
    const ex = excelByBookingId.get(Number(b.id));
    if (!ex) continue;
    const dbTuple = ownedTupleFromDb({
      payment_status: b.payment_status ?? null,
      admin_notes: b.admin_notes ?? null,
      amount_paid: b.amount_paid != null ? Number(b.amount_paid) : null,
    });
    const dbHash = tupleHash(dbTuple);
    const { tuple: exTuple, raw } = excelTupleFor(b);
    if (!exTuple || !raw) continue;
    const excelHash = tupleHash(exTuple);
    const pair = classifyPair(dbHash, excelHash, b.excel_hash ?? null);
    if (pair !== 'excel-only' && pair !== 'both-changed') continue;

    const newStatus = normalizeExcelStatus(raw.status);
    const newDeposit = parseDeposit(raw.deposit);
    const newNotes = normalizeNotes(raw.notes);
    if (newStatus == null || newDeposit == null) continue;

    const before = {
      payment_status: b.payment_status ?? null,
      amount_paid: b.amount_paid ?? null,
      admin_notes: b.admin_notes ?? null,
    };
    const excelValues = { status: raw.status, deposit: raw.deposit, notes: raw.notes };

    await supabaseAdmin.from('bookings').update({
      payment_status: newStatus,
      amount_paid: newDeposit,
      admin_notes: newNotes,
      excel_hash: excelHash,
      excel_synced_at: new Date().toISOString(),
    }).eq('id', b.id);

    b.payment_status = newStatus;
    b.amount_paid = newDeposit;
    b.admin_notes = newNotes;
    b.excel_hash = excelHash;

    if (pair === 'excel-only') {
      pulled += 1;
    } else {
      conflicts += 1;
      await supabaseAdmin.from('sync_conflicts').insert({
        booking_id: b.id,
        excel_values: excelValues,
        supabase_values: before,
      });
    }
  }

  return NextResponse.json({ pushed, pulled, conflicts, warnings, errors });
}
