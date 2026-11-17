# WhatsApp Booking Flow + OneDrive Excel Sync — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace Billplz as the main booking path with a WhatsApp confirmation flow; add a manually-triggered two-way Supabase↔OneDrive-Excel sync for staff.

**Architecture:** Guest books via BookingModal → `POST /api/booking-create` → Supabase row (`payment_status='pending'`, 24h hold). Guest lands on `/booking-sent` with a wa.me deep link. Availability = `paid`/`confirmed` block; `pending` shows faint, never blocks. Admin clicks "Sync Excel" in finest-touch → `POST /api/admin/sync-excel` → Graph token from `sync_credentials` → push new rows + pull owned fields (`status`,`notes`,`amount_paid`; Excel wins) → conflicts logged to `sync_conflicts`. Billplz code dormant, untouched.

**Spec:** `docs/superpowers/specs/2026-11-18-whatsapp-booking-sync-design.md`

**Tech Stack:** Next.js 16 App Router, Supabase (service role + client), next-intl (ms default), Microsoft Graph REST (raw `fetch` — no SDK), Node 24 `--test` (tests import `.ts` directly; pattern from `scripts/seo.test.mjs`).

## Global Constraints

- ms is the default locale; en for non-MY guests; nothing new is hardcoded English-only.
- IC number is dropped everywhere in the new flow (form, payload, DB write, Excel push, message, admin notes). Billplz code path untouched.
- No new npm dependencies. Crypto = `node:crypto` (AES-256-GCM). Graph = raw `fetch`.
- All network calls to Graph happen server-side only; tokens never reach the client.
- Test runner: `node --test --disable-warning=MODULE_TYPELESS_PACKAGE_JSON`. Test files live in `scripts/<name>.test.mjs` and import `../lib/<name>.ts`.
- Blocking statuses: `paid`, `confirmed`. Pending never blocks. Expired pending (created_at < now-24h) = not shown even as tentative (lazy check in app code, no DB sweep).
- Billplz files (`app/api/checkout`, `callback`, `booking-status`, `cron/`, `app/[locale]/success`) stay byte-for-byte unchanged.
- `/booking-sent` ships with no PII when sessionStorage is absent.

## Review Focus (five likeliest bites, each pinned to its task)

1. Guest opens `/booking-sent` directly/reload after close — no sessionStorage, no PII leak → Task 6 fallback test.
2. Excel row without ID or with colon characters — must surface as warning, never crash or corrupt rows → Task 8 label/row-mapper test.
3. Pending older than 24h still greying the calendar as "tentative" → Task 1 age-helper test, applied in Tasks 5 and 7.
4. Graph token refresh rotation (new refresh token returned on refresh) — dropping it = permanent auth death → Task 7 roundtrip/refresh test + reconnect path.
5. Double-tap on confirm button creates two holds for same guest → Task 5 disables CTA while in flight (checked in Task 11 build/smoke).

---

### Task 1: Shared booking helpers + tests

**Files:**
- Create: `lib/booking.ts`
- Create: `scripts/booking.test.mjs`
- Modify: `package.json:10` → `"test": "node --test --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/seo.test.mjs scripts/booking.test.mjs scripts/excel-sync.test.mjs scripts/whatsapp.test.mjs scripts/token-crypto.test.mjs"`

**Interfaces:**
- Consumes: none.
- Produces, exact exports from `lib/booking.ts`:
  - `BLOCKING_STATUSES: string[]` = `['paid','confirmed']`
  - `TENTATIVE_STATUS: string` = `'pending'`
  - `isBlockingStatus(status: string | null | undefined): boolean`
  - `isHoldActive(createdAtIso: string | Date | null | undefined, now?: Date): boolean` — false if missing/invalid/older than 24h
  - `HOLD_HOURS: number` = `24`

- [ ] **Step 1: Write the failing test** `scripts/booking.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLOCKING_STATUSES, TENTATIVE_STATUS, isBlockingStatus, isHoldActive, HOLD_HOURS } from '../lib/booking.ts';

test('blocking statuses are paid and confirmed', () => {
  assert.deepEqual(BLOCKING_STATUSES, ['paid', 'confirmed']);
  assert.equal(isBlockingStatus('paid'), true);
  assert.equal(isBlockingStatus('confirmed'), true);
  assert.equal(isBlockingStatus('pending'), false);
  assert.equal(isBlockingStatus(null), false);
});

test('HOLD_HOURS is 24', () => assert.equal(HOLD_HOURS, 24));

test('isHoldActive: fresh timestamp is active', () => {
  const now = new Date('2026-11-18T00:00:00Z');
  const fresh = new Date(now.getTime() - 60_000).toISOString();
  assert.equal(isHoldActive(fresh, now), true);
});

test('isHoldActive: 24h+1s old is expired', () => {
  const now = new Date('2026-11-18T00:00:00Z');
  const old = new Date(now.getTime() - 24*3600*1000 - 1000).toISOString();
  assert.equal(isHoldActive(old, now), false);
});

test('isHoldActive: boundary inclusive at exactly 24h', () => {
  const now = new Date('2026-11-18T00:00:00Z');
  const exact = new Date(now.getTime() - 24*3600*1000).toISOString();
  assert.equal(isHoldActive(exact, now), true);
});

test('isHoldActive: junk input is inactive', () => {
  assert.equal(isHoldActive('garbage'), false);
  assert.equal(isHoldActive(null), false);
});
```

- [ ] **Step 2: Run, expect FAIL** — `npm test -- scripts/booking.test.mjs` (module not found).
- [ ] **Step 3: Implement `lib/booking.ts`** with the five exports above; age comparison at exactly 24h is active (`>=`), over it expired.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git add lib/booking.ts scripts/booking.test.mjs package.json && git commit -m "feat: shared booking status helpers (blocking/tentative/hold-expiry)"`.

### Task 2: SQL migration

**Files:**
- Create: `add_whatsapp_sync.sql`

**Interfaces:**
- Consumes/Produces: on `bookings`, add nullable columns `excel_synced_at timestamptz`, `excel_row_ref int`, `excel_hash text` (all `IF NOT EXISTS`, no drops, no RLS changes — service role bypasses RLS). New tables: `sync_credentials(id bigserial primary key, provider text unique not null default 'graph', refresh_token_enc text, access_token_enc text, expires_at timestamptz, account_upn text, item_id text, worksheet text, updated_at timestamptz default now())` and `sync_conflicts(id bigserial primary key, booking_id bigint references bookings(id) on delete cascade, excel_values jsonb, supabase_values jsonb, created_at timestamptz default now(), resolved_at timestamptz)`. Index: `create index if not exists idx_bookings_payment_status on bookings(payment_status);`. File must be idempotent (running twice errors nothing).

- [ ] **Step 1: Write `add_whatsapp_sync.sql`** per the interface above.
- [ ] **Step 2: Commit** — `git add add_whatsapp_sync.sql && git commit -m "chore(db): add whatsapp sync columns/tables/index (idempotent)"`.
- [ ] **Step 3: Add a note in Task 11's runbook that this SQL must be executed in the Supabase SQL editor before deploy.**

### Task 3: WhatsApp message builder + tests

**Files:**
- Create: `lib/whatsapp.ts`
- Create: `scripts/whatsapp.test.mjs`

**Interfaces:**
- Consumes: `BUSINESS`, `waLink` from `lib/site.ts` (do not import new things from elsewhere).
- Produces, exact exports:
  - `type WhatsAppBookingPayload = { id: number | null; roomTitle: string; unitName: string | null; guestName: string; guestPhone: string; checkIn: string; checkOut: string; checkInTime: string; checkOutTime: string; packageName: string; unitsCount: number; totalPrice: number }`
  - `buildBookingMessage(p: WhatsAppBookingPayload, locale: string): string` — `locale.startsWith('ms')` → Bahasa Malaysia message; otherwise English. No IC anywhere. Includes: Booking ID (or `DRAFT` when null), room/unit, name, phone, check-in/out + times, package, units, total (`RM450` no decimals), `Status: Pending deposit (held 24h)` / `Status: Menunggu deposit (dipegang 24 jam)`. Money: `Math.round`.
  - `buildWhatsAppLink(p: WhatsAppBookingPayload, locale: string): string` — `waLink(`… never call waLink with undefined; safe encode.`

- [ ] **Step 1: Write the failing test** `scripts/whatsapp.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBookingMessage, buildWhatsAppLink } from '../lib/whatsapp.ts';

const p = { id: 42, roomTitle: 'Homestay 5', unitName: 'Unit A', guestName: 'Aisyah',
  guestPhone: '0123456789', checkIn: '2026-11-20', checkOut: '2026-11-22',
  checkInTime: '15:00', checkOutTime: '12:00', packageName: 'Basic + BBQ',
  unitsCount: 1, totalPrice: 450 };

test('ms message contains label + values and no IC', () => {
  const m = buildBookingMessage(p, 'ms');
  assert.match(m, /42/);
  assert.match(m, /Aisyah/);
  assert.match(m, /2026-11-20/);
  assert.match(m, /RM450/);
  assert.doesNotMatch(m, /ic|ic_number|6708|0123456789.*ic/i); // no IC-shaped label
  assert.match(m, /deposit/i);
});

test('en message differs from ms and keeps English words', () => {
  const m = buildBookingMessage(p, 'en');
  assert.match(m, /Pending deposit/i);
  assert.match(m, /Unit/);
});

test('link encodes emoji-free message (wa.me/601157572001?text=...)', () => {
  const link = buildWhatsAppLink(p, 'ms');
  assert.ok(link.startsWith('https://wa.me/601157572001?text='));
  assert.ok(link.includes('%2A') || link.includes('*NEW'));
});

test('id null renders DRAFT placeholder', () => {
  const m = buildBookingMessage({ ...p, id: null }, 'ms');
  assert.match(m, /DRAFT/);
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement `lib/whatsapp.ts`** per Interfaces. Message shape (multi-line, `*bold*` markers):
```
*NEW BOOKING — PENDING*
Booking ID: 42
Room: Homestay 5 (Unit A)
Name: Aisyah
Phone: 0123456789
Check-in: 2026-11-20 15:00
Check-out: 2026-11-22 12:00
Package: Basic + BBQ
Units: 1
Total: RM450
Status: Pending deposit (held 24h)
```
Malaysia label line "Tempahan Baru — Menunggu Deposit" for ms head. No emoji.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git add lib/whatsapp.ts scripts/whatsapp.test.mjs && git commit -m "feat: locale-aware WhatsApp booking message + wa.me link builder"`.

### Task 4: Token at-rest crypto (AES-256-GCM) + tests

**Files:**
- Create: `lib/token-crypto.ts`
- Create: `scripts/token-crypto.test.mjs`

**Interfaces:**
- Consumes: env `SYNC_TOKEN_ENCRYPTION_KEY` (64-char hex = 32 bytes). If missing/invalid → throw `TOKEN_CRYPTO_MISCONFIGURED` (caller maps to 500).
- Produces exports (all synchronous):
  - `encryptToken(plain: string): string` → base64url of `IV || authTag || ciphertext` (iv 12 bytes)
  - `decryptToken(blob: string): string` → original plain; throws `DECRYPT_FAILED` on tamper
  - `sha256(input: string): string` → hex (used by `lib/excel-sync.ts` in Task 8)

- [ ] **Step 1: Write the failing test** `scripts/token-crypto.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.SYNC_TOKEN_ENCRYPTION_KEY = 'ab'.repeat(32);
const { encryptToken, decryptToken, sha256 } = await import('../lib/token-crypto.ts');

test('roundtrip preserves plaintext incl. unicode', () => {
  const c = encryptToken('rahasia🔐 token');
  assert.notEqual(c, 'rahasia🔐 token');
  assert.equal(decryptToken(c), 'rahasia🔐 token');
});

test('two encryptions differ (random IV)', () => {
  assert.notEqual(encryptToken('x'), encryptToken('x'));
});

test('tampered blob throws DECRYPT_FAILED', () => {
  const c = encryptToken('secret');
  const bad = c.slice(0, -2) + (c.endsWith('AA') ? 'BB' : 'AA');
  assert.throws(() => decryptToken(bad), /DECRYPT_FAILED/);
});

test('sha256 is stable', () => {
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
```

- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** `lib/token-crypto.ts` using `node:crypto` `createCipheriv('aes-256-gcm', key, iv)` and `createDecipheriv`; key from `Buffer.from(process.env!.SYNC_TOKEN_ENCRYPTION_KEY!, 'hex')`; validate length 32 else throw same error class.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git add lib/token-crypto.ts scripts/token-crypto.test.mjs && git commit -m "feat: AES-256-GCM token encryption helpers for sync credentials"`.

### Task 5: `POST /api/booking-create` route

**Files:**
- Create: `app/api/booking-create/route.ts` (copy of `app/api/checkout/route.ts`, Billplz section stripped)
- Modify: nothing in `app/api/checkout/*` (dormant, byte-identical)

**Interfaces:**
- Consumes: `calculatePrice` from `@/lib/price-utils`, `readJsonBody` from `@/lib/readJsonBody`, service-role `createClient(...supabase...)` exactly as checkout does (duplicated client fallback pattern is acceptable here — checkout must not be refactored).
- Produces:
  - Request JSON: `{ listingId, title, guestPhone, guestName, checkIn, checkOut, unitName?, packageName?, checkInTime?, checkOutTime?, unitsCount?, addOns? }` (no `icNumber`, no `price` from client).
  - Response: `{ id: number, totalPrice: number }` on 200; `{ error }` 400/500 otherwise.
  - Inserts with `payment_status: 'pending'`, `ic_number: null`, same price recalculation and overlap check as checkout **except** overlap query uses `.in('payment_status', ['paid','confirmed'])`.
  - `check_in_time`/`check_out_time` stored raw; `package_name` formatted same suffix as checkout (`(In: ${checkInTime}, Out: ${checkOutTime})`).

- [ ] **Step 1: Copy `app/api/checkout/route.ts` → `app/api/booking-create/route.ts`.** Delete lines from `// 4. Create Billplz bill` to the `// 5. Update booking` block. Remove `price`/`icNumber` from destructured input, hardcode `ic_number: null`, set `payment_status: 'pending'`, change overlap `.eq('payment_status', 'paid')` → `.in('payment_status', ['paid','confirmed'])`. Replace the final return with `{ id: booking.id, totalPrice: finalPrice }` (booking var comes from the retained insert). Remove `import crypto` and the `crypto` block.
- [ ] **Step 2: Verify by reading the file** — confirm no Billplz/crypto/ic references remain (`grep -n -i "billplz\|crypto\|ic_number" app/api/booking-create/route.ts` shows only `ic_number: null`).
- [ ] **Step 3: Run `npm run lint`, fix only new-file issues.**
- [ ] **Step 4: Commit** — `git add app/api/booking-create/route.ts && git commit -m "feat(api): booking-create endpoint stores pending WhatsApp booking (Billplz untouched)"`.

### Task 6: BookingModal rework + `/booking-sent` page + i18n

**Files:**
- Modify: `components/BookingModal.tsx` (remove IC field/state/payload; replace `handlePay` with `handleSendBooking`; CTA label key `Booking.sendBooking`; inline T&C list above CTA)
- Create: `app/[locale]/booking-sent/page.tsx` (client component, pattern copied from `app/[locale]/success/page.tsx`)
- Modify: `messages/ms.json`, `messages/en.json` — `Booking` + new `BookingSent` namespace

**Interfaces:**
- Consumes: `POST /api/booking-create` (Task 5), `buildBookingMessage`/`buildWhatsAppLink` from `lib/whatsapp.ts` (Task 3), `isHoldActive` from `lib/booking.ts` (Task 1, used in Task 7, not here).
- Produces: sessionStorage key `booking_sent` holding the full `WhatsAppBookingPayload` + `totalPrice` + `locale` string. `/booking-sent` reads that key only.

- [ ] **Step 1: BookingModal** — remove the IC input + `icNumber` state + `icNumber` from POST body + any `t("Booking.ic")` label usage. Replace `handlePay` body: POST to `/api/booking-create` with the same fields minus `price`/`icNumber`; on `data.id` success: `sessionStorage.setItem('booking_sent', JSON.stringify(payload))` then `window.location.href = '/' + (window.location.pathname.split('/')[1] || 'ms') + '/booking-sent'`. Errors: `setError(t("Booking.errBooking"))`; loading state `t("Booking.processing")` — **CTA is disabled while the request is in flight** (double-click guard). Button label `t("Booking.sendBooking")`.
- [ ] **Step 2: T&C block** — above the CTA render `<ul>` with six `t("Booking.tc1")…tc6` items (exact text in Step 4) plus a small header `t("Booking.termsTitle")`. No link/route, no checkbox.
- [ ] **Step 3: `/booking-sent` page** — copy `success/page.tsx` skeleton (same bg/surface/card styles, `animate-scale-in`). Read `sessionStorage.getItem('booking_sent')`; if absent render generic no-PII card (`BookingSent.titleGeneric` + `BookingSent.bodyGeneric` + home link). If present: summary grid (room, unit, dates + times, package, total, `BookingSent.holdNotice`), green wa.me button linking `buildWhatsAppLink(payload, payload.locale || 'ms')`, secondary home link.
- [ ] **Step 4: i18n keys** (ms shown; en mirrored, English wording from existing Success namespace style):
```json
"sendBooking": "Hantar Tempahan ke WhatsApp",
"errBooking": "Tempahan tidak dapat disimpan. Sila cuba lagi, atau WhatsApp kami.",
"termsTitle": "Syarat & Terma Tempahan",
"tc1": "Tempahan adalah tahanan 24 jam, bukan pengesahan, sehingga deposit dibayar.",
"tc2": "Tahanan yang tidak dibayar dalam 24 jam luput secara automatik.",
"tc3": "Deposit ditetapkan oleh staf; butiran dihantar melalui WhatsApp.",
"tc4": "Batal sebelum deposit: percuma, beritahu kami di WhatsApp.",
"tc5": "Ubah/batal selepas deposit: dasar staf terpakai, bayaran balik secara manual.",
"tc6": "Maklumat tetamu disimpan dalam Supabase dan dikongsi kepada pemilik melalui Excel OneDrive.",
"BookingSent.title": "Tempahan Direkod!",
"BookingSent.body": "Tempahan anda telah direkod sebagai tahanan 24 jam. Hantar butiran di bawah ke WhatsApp kami untuk pengesahan deposit.",
"BookingSent.genericTitle": "Tempahan Direkod",
"BookingSent.genericBody": "Tempahan anda telah direkod. Sila WhatsApp kami dengan butiran tempahan anda.",
"BookingSent.holdNote": "Tahanan luput dalam 24 jam jika tiada deposit.",
"BookingSent.backHome": "Kembali ke Laman Utama",
"BookingSent.sendWa": "Hantar Butiran Tempahan ke WhatsApp"
```
- [ ] **Step 5: Run tests + lint** — `npm test`, `npm run lint`.
- [ ] **Step 6: Commit** — `git add components/BookingModal.tsx "app/[locale]/booking-sent" messages/ms.json messages/en.json && git commit -m "feat(booking): WhatsApp booking CTA, T&C block, booking-sent page (ms/en)"`.

### Task 7: Availability — blocking switch + tentative overlay

**Files:**
- Modify: `components/BookingCalendar.tsx`
- Modify: `components/RoomsSection.tsx`
- Modify: `components/BookingModal.tsx`
- Modify: `messages/ms.json`, `messages/en.json` (`Calendar` namespace: new keys)
- Modify: global stylesheet (find it — likely `app/globals.css` or similar; grep `modal-backdrop`)

**Interfaces:**
- Consumes: `BLOCKING_STATUSES`, `isHoldActive`, `TENTATIVE_STATUS` from `lib/booking.ts`.

- [ ] **Step 1: All three queries** — replace `.eq("payment_status", "paid")` with `.in("payment_status", [...BLOCKING_STATUSES])` (BookingCalendar line ~86, RoomsSection line ~81, BookingModal line ~412). This restores nothing else — Billplz books stay blocking because they are `paid`.
- [ ] **Step 2: BookingCalendar tentative layer** — extend the blocking query's `select` with `created_at`; after computing dates for blocking rows, compute `tentativeDays` from rows **not** blocking but with `payment_status='pending'` and `isHoldActive(created_at)`; same unit/overlap logic as existing for both sets. Days blocked AND tentative render blocked only.
- [ ] **Step 3: Tentative rendering** — on a day element (find the day cell JSX), if in `tentativeDays` add `data-tentative="true"` and CSS class `calendar-tentative`; add class in the global stylesheet: amber fill at 18% opacity + dashed 2px border (token-style vars if any exist; else `rgba(245,158,11,.18)` + `border: 1px dashed rgba(245,158,11,.7)`). Do not replace existing booked style.
- [ ] **Step 4: Legend + a11y** — new key `Calendar.legendTentative` = "Tempahan menunggu deposit — masih boleh ditempah" (en: "Awaiting deposit — still bookable") and add a legend row using it with the same swatch as `.calendar-tentative`; `aria-label`/`data-tentative` on day cell states tentative but bookable.
- [ ] **Step 5: Expiry** — ensure tentative computation skips rows where `isHoldActive(created_at)` is false (no style added). Confirm modal unavailableUnits query remains blocking-only.
- [ ] **Step 6: Run tests + lint, commit** — `npm test`, `npm run lint`; `git add -A components "app/globals.css" messages/ms.json messages/en.json && git commit -m "feat(calendar): block on paid+confirmed, show pending as tentative-bookable"`.

### Task 8: Excel sync library (pure logic) + tests

**Files:**
- Create: `lib/excel-sync.ts`
- Create: `scripts/excel-sync.test.mjs`

**Interfaces:**
- Consumes: `sha256` from `lib/token-crypto.ts` (Task 4).
- Produces, exact exports:
  - `type OwnedTuple = { status: string | null; notes: string | null; deposit: number }`
  - `normalizeExcelStatus(raw: unknown): 'pending' | 'confirmed' | 'cancelled' | null` — trim, lowercase, map `pending|booked|baru`→pending, `confirmed|sah|deposit paid|paid`→confirmed, `cancelled|batal|cancel`→cancelled, anything else → null.
  - `toExcelStatus(dbStatus: string): string` — pending/awaiting_payment→`Pending`, paid/confirmed→`Confirmed`, failed/cancelled→`Cancelled`.
  - `parseDeposit(raw: unknown): number | null` — strips `RM`, commas, spaces, trailing text like `deposit`; NaN → null.
  - `normalizeNotes(raw: unknown): string` — trim, CRLF→LF.
  - `ownedTupleFromDb(b: { payment_status: string | null; admin_notes: string | null; amount_paid: number | null }): OwnedTuple`
  - `ownedTupleFromExcel(statusRaw: unknown, notesRaw: unknown, depositRaw: unknown): OwnedTuple | null` — null if status unmappable OR deposit invalid.
  - `tupleHash(t: OwnedTuple): string` — `sha256(`${status}|${notes}|${deposit.toFixed(2)}`)` with nulls → empty strings.
  - `classifyPair(dbHash: string, excelHash: string, storedHash: string | null): 'both-changed' | 'excel-only' | 'db-only' | 'unchanged'` — stored null ⇒ non-null tuples classify as db-only if dbHash===excelHash else both-changed? No — stored null means never synced; treat as db-only (safe: first sync seeds hash from Supabase; rows never touched since excel rows are created by our append only). So stored null → 'db-only'.
  - `findColumnIndexes(headers: string[]): Record<string, number>` — case-insensitive, trimmed key match for columns `id, guest, phone, unit, room, check-in, check-out, package, units, total, status, deposit, notes, created`; returns `{}` entries for missing; also tolerant of `check in`, `checkin`, `pkg`.
  - `REQUIRED_COLUMNS: string[]` = `['id','guest','check-in','check-out','status','deposit','notes','created']`.

- [ ] **Step 1: Write the failing test** `scripts/excel-sync.test.mjs` covering: label mapping ("Sah"→confirmed, "batal"→cancelled, "xyz"→null), `toExcelStatus` both flows, parseDeposit variants ("RM450", "1,200.50", "deposit paid: 450"→450, "abc"→null), normalizeNotes CRLF, `classifyPair` truth table incl. storedHash null→db-only, `findColumnIndexes` with shuffled case ("STATUS", " Notes") and missing keys.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement** `lib/excel-sync.ts` per Interfaces; no I/O, no fetch.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `git add lib/excel-sync.ts scripts/excel-sync.test.mjs && git commit -m "feat: pure excel sync logic (status map, owned-tuple hash, column locate)"`.

### Task 9: Graph auth helper + `POST /api/admin/sync-excel`

**Files:**
- Create: `lib/graph-auth.ts`
- Create: `app/api/admin/sync-excel/route.ts`
- Create: (embedded in route) `columnLetter(i: number): string` base-26 with 'A'=0 — no test needed (internal), verified in mocked test if any; keep pure inside route.

**Interfaces:**
- Consumes: `verifyStaff` (`@/lib/auth-utils`), `supabaseAdmin` (`@/lib/supabaseAdmin`), `encryptToken`/`decryptToken` (Task 4), excel lib (Task 8), env `NEXT_PUBLIC_BASE_URL`, `SYNC_TOKEN_ENCRYPTION_KEY`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`.
- Produces: `getValidAccessToken(): Promise<{ token: string; account: string } | { error: string }>` in `lib/graph-auth.ts`:
  - read `sync_credentials` singleton row; missing → `{ error: 'microsoft_not_connected' }`
  - decrypt refresh token; if `expires_at < now+300s` (or refresh anyway on force) →
    POST `https://login.microsoftonline.com/common/oauth2/v2.0/token` with `grant_type=refresh_token&client_id&client_secret&refresh_token=…&scope=offline_access Files.ReadWrite`
    (`common` accepts MSA personal accounts — do NOT use `consumers` here since app is multi-tenant).
    On non-200 → delete credentials row, return `{ error: 'microsoft_token_refresh_failed' }`.
    On 200 → store **both** new access token and new refresh token if returned (rotation-safe: always persist `refresh_token ?? old`), set `expires_at`.
  - returns token + `account_upn`.
- Produces route behavior `POST /api/admin/sync-excel`:
  1. `verifyStaff()` → 401 if not staff.
  2. `getValidAccessToken()` → 400 `{ error }` on failure (pass-through).
  3. `GET /me/drive/items/{item_id}/workbook/worksheets('{worksheet}')/usedRange?$select=values` with Bearer token. Non-2xx → 502 `{ error: 'graph_read_failed', status, detail }`.
  4. Parse: base row from `values` array (usedRange values start at the range's first cell — for A1-anchored sheets, row = index+1; if the sheet has frozen title rows, staff must not have blank leading rows; documented in runbook). Headers = values[0]; locate indexes via `findColumnIndexes`; missing any `REQUIRED_COLUMNS` → 400 `{ error: 'sheet_missing_columns', missing }`.
  5. Load all `bookings` (id, guest_name, guest_email, check_in/out, check_in_time/check_out_time, unit_name, package_name, units_count, total_price, payment_status, amount_paid, admin_notes, created_at, excel_row_ref, excel_hash/excel_synced_at). Load rooms map (id→title) once.
  6. Push (appends): bookings with null `excel_row_ref` → for each, compute target row = baseRow + values.length (usedRange current extent) + offsetInThisBatch; PATCH `range(address='A{n}:N{n}')` body `{ values: [[...14 cells]] }`; on success set `excel_row_ref=n`, `excel_synced_at=now`, `excel_hash=tupleHash(ownedTupleFromDb(b))`. Collect failures into `errors[]`, continue with rest.
     After appends, reload `values` extent counter locally (track n as we go — do not re-GET).
  7. Push (db-only updates): matched bookings (excel_row_ref not null) where classifyPair(dbHash, excelHash(current row), storedHash)==='db-only' → PATCH Status/Deposit/Notes cells only (Status=toExcelStatus, Deposit=amount_paid, Notes=admin_notes); update hash.
  8. Pull: classifyPair:
     - `excel-only` → update booking `payment_status=normalizeExcelStatus, amount_paid=parseDeposit, admin_notes=normalizeNotes`; update hash + synced_at; `pulled++`.
     - `both-changed` → same update; insert `sync_conflicts(booking_id, excel_values jsonb of the three cells before apply, supabase_values jsonb of db before apply)`; `conflicts++`.
  9. `unchanged` → skip. Rows with empty/non-numeric ID or ID not in DB → `warnings.push({ row, reason })`.
  10. Response `{ pushed, pulled, conflicts, warnings, errors }` — `pushed` counts appends, `pulled` counts pulls, all values JSON-serializable; admin UI consumes it verbatim.
- [ ] **Step 1: Implement `lib/graph-auth.ts`** per Interfaces; no try/catch swallow — every path returns explicit results; route maps to HTTP codes.
- [ ] **Step 2: Implement route** per Interfaces; row-level writes only, never whole-worksheet replace; do not use `range(address=...)` with Write across owned cells during push (Status/Deposit/Notes are pushed from DB in db-only only — see step 7).
- [ ] **Step 3: Run build (`npm run build`) to typecheck the new files; fix type errors.**
- [ ] **Step 4: Commit** — `git add lib/graph-auth.ts app/api/admin/sync-excel/route.ts && git commit -m "feat(sync): admin-triggered two-way Supabase<->OneDrive Excel sync via Graph"`.

### Task 10: Microsoft connect/disconnect routes

**Files:**
- Create: `app/api/auth/graph/route.ts` (GET — start)
- Create: `app/api/auth/graph/callback/route.ts` (GET — code exchange)
- Create: `app/api/admin/microsoft/disconnect/route.ts` (POST)

**Interfaces:**
- Consumes: `verifyStaff`, `supabaseAdmin`, `encryptToken`, env `NEXT_PUBLIC_BASE_URL`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `SYNC_EXCEL_ITEM_ID`, `SYNC_EXCEL_WORKSHEET` (runbook documents both), `SYNC_TOKEN_ENCRYPTION_KEY`.
- Produces:
  - `GET /api/auth/graph` — staff-only; generates 16-byte hex `state`, sets httpOnly cookie `graph_state` (10 min, SameSite=Lax), 302 to `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=…&response_type=code&redirect_uri=…/api/auth/graph/callback&scope=offline_access%20Files.ReadWrite%20User.Read&state=…&response_mode=query`.
  - `GET /api/auth/graph/callback` — verifies state cookie === query state (else 400); POST token endpoint with `grant_type=authorization_code` for code → tokens; requires `refresh_token` in response (scope offline_access) else 400 `consent_missing`; fetch `/me` to get `upn`/`displayName`; upsert singleton row: `{ provider: 'graph', refresh_token_enc: encryptToken(rt), access_token_enc: encryptToken(at), expires_at: now+expires_in, account_upn: upn, item_id: env SYNC_EXCEL_ITEM_ID ?? '', worksheet: env SYNC_EXCEL_WORKSHEET ?? 'Book1', updated_at: now }`; redirect to `/finest-touch?microsoft=connected` (admin panel route — check existing path in `app/(admin)`; adjust redirect target in callback accordingly).
  - `POST /api/admin/microsoft/disconnect` — staff-only; best-effort POST `https://login.microsoftonline.com/common/oauth2/v2.0/revoke` with refresh token; delete credentials row regardless; returns `{ ok: true }`.
- [ ] **Step 1: Implement the three routes** exactly per Interfaces (each ~60–80 lines).
- [ ] **Step 2: Run build, fix type errors.**
- [ ] **Step 3: Commit** — `git add app/api/auth/graph app/api/admin/microsoft && git commit -m "feat(auth): one-time Microsoft MSA connect + encrypted token storage"`.

### Task 11: Admin UI + runbook + UAT

**Files:**
- Modify: `components/finest/BookingsPanel.tsx`
- Create: `docs/onedrive-sync-setup.md`

**Interfaces:**
- Consumes: `POST /api/admin/sync-excel` response shape from Task 9; `GET/POST` auth + disconnect routes from Task 10.
- Produces: UI states + runbook document (owner follow-up items: Azure app, sheet upload, SQL run).

- [ ] **Step 1: BookingsPanel header** — add button "Sync Excel" (reuse existing button classes; disabled while request in flight, label `Menyegerak…`/`Syncing…` via existing locale pattern). On click POST `/api/admin/sync-excel` (cookie session — same pattern as bookings API calls in that file). Show inline result line: `Mendorong N, menarik M, konflik K` + warnings/errors list (ms/en via existing t() or plain both-language text; keep one-line each).
- [ ] **Step 2: Connection pill** — "Microsoft: Connected (upn)" / "Microsoft: Not connected" + "Connect" link to `/api/auth/graph`, "Disconnect" button POSTing disconnect route; pill state read from a tiny `GET /api/admin/microsoft/status` (add to same route file as Task 10 disconnect? No — create `app/api/admin/microsoft/status/route.ts` GET: verifyStaff → row exists + account_upn + expires_at).
- [ ] **Step 3: Status dropdown** — existing `<select>` for `payment_status` gains options `pending`, `confirmed`, `cancelled` (values literal; labels reuse existing translation keys where available, else plain ms/en).
- [ ] **Step 4: Runbook** `docs/onedrive-sync-setup.md`: (a) Azure app registration steps with exact fields (account type string, redirect URI, scopes, client secret); (b) `SYNC_TOKEN_ENCRYPTION_KEY` generation command (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) + where it goes (Vercel env + local `.env.local`); (c) upload xlsx to OneDrive, get item id via Graph Explorer `GET /me/drive/root:/<name>:`, set `SYNC_EXCEL_ITEM_ID`/`SYNC_EXCEL_WORKSHEET` env; (d) run `add_whatsapp_sync.sql` in Supabase SQL editor; (e) first sync + expected warnings; (f) sheet column contract + status label table (from spec).
- [ ] **Step 5: UAT checklist** (run, record results in commit message body or PR description):
  1. Guest books → row in Supabase `pending`, slot faint on site, `/booking-sent` shows summary + WA button, wa.me link text ms/en correct, no IC.
  2. Reload `/booking-sent` direct → no PII fallback card.
  3. Click Sync → row appended to staff xlsx; `excel_row_ref`/hash set.
  4. Staff sets Status=Confirmed in Excel → sync → booking `confirmed`, slot solid-grey.
  5. Staff sets Status=Batal → sync → `cancelled`, slot un-greyed, conflict-free.
  6. Both sides edited same row → Excel wins, `sync_conflicts` row created, admin result shows conflicts count.
  7. `/api/checkout` still builds a Billplz bill in sandbox if manually POSTed (dormant flow intact).
  8. `npm test`, `npm run lint`, `npm run build` all green.
- [ ] **Step 6: Commit** — `git add -A components/finest "app/api/admin/microsoft" docs/onedrive-sync-setup.md && git commit -m "feat(admin): Sync Excel button, MS connect pill, runbook + UAT results"`.

