import { sha256 } from './token-crypto.ts';

export type OwnedTuple = { status: string | null; notes: string | null; deposit: number };

export const REQUIRED_COLUMNS: string[] = ['id', 'guest', 'check-in', 'check-out', 'status', 'deposit', 'notes', 'created'];

export function normalizeExcelStatus(raw: unknown): 'pending' | 'confirmed' | 'cancelled' | null {
  if (raw == null) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (['pending', 'booked', 'baru'].includes(s)) return 'pending';
  if (['confirmed', 'sah', 'deposit paid', 'paid'].includes(s)) return 'confirmed';
  if (['cancelled', 'batal', 'cancel'].includes(s)) return 'cancelled';
  return null;
}

export function toExcelStatus(dbStatus: string): string {
  switch (dbStatus) {
    case 'pending':
    case 'awaiting_payment':
      return 'Pending';
    case 'paid':
    case 'confirmed':
      return 'Confirmed';
    case 'failed':
    case 'cancelled':
      return 'Cancelled';
    default:
      return dbStatus;
  }
}

export function parseDeposit(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw);
  if (!s.trim()) return null;
  const cleaned = s.replace(/,/g, '');
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

export function normalizeNotes(raw: unknown): string {
  if (raw == null) return '';
  return String(raw).trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function ownedTupleFromDb(b: { payment_status: string | null; admin_notes: string | null; amount_paid: number | null }): OwnedTuple {
  return {
    status: b.payment_status ?? null,
    notes: b.admin_notes == null ? null : normalizeNotes(b.admin_notes),
    deposit: b.amount_paid ?? 0,
  };
}

export function ownedTupleFromExcel(statusRaw: unknown, notesRaw: unknown, depositRaw: unknown): OwnedTuple | null {
  const status = normalizeExcelStatus(statusRaw);
  if (status == null) return null;
  const deposit = parseDeposit(depositRaw);
  if (deposit == null) return null;
  return {
    status,
    notes: normalizeNotes(notesRaw),
    deposit,
  };
}

export function tupleHash(t: OwnedTuple): string {
  const status = t.status ?? '';
  const notes = t.notes ?? '';
  const deposit = t.deposit.toFixed(2);
  return sha256(`${status}|${notes}|${deposit}`);
}

export function classifyPair(dbHash: string, excelHash: string, storedHash: string | null): 'both-changed' | 'excel-only' | 'db-only' | 'unchanged' {
  if (storedHash == null) return 'db-only';
  if (dbHash === storedHash && excelHash === storedHash) return 'unchanged';
  if (dbHash !== storedHash && excelHash === storedHash) return 'db-only';
  if (dbHash === storedHash && excelHash !== storedHash) return 'excel-only';
  return 'both-changed';
}

export function findColumnIndexes(headers: string[]): Record<string, number> {
  const aliases: Record<string, string> = {
    'check in': 'check-in',
    checkin: 'check-in',
    pkg: 'package',
  };
  const out: Record<string, number> = {};
  for (let i = 0; i < headers.length; i++) {
    const raw = String(headers[i] ?? '').trim().toLowerCase();
    if (!raw) continue;
    const key = aliases[raw] ?? raw;
    out[key] = i;
  }
  return out;
}
