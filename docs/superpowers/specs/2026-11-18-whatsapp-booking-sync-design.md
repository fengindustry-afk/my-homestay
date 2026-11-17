# WhatsApp Booking Flow + OneDrive Excel Sync — Design

Date: 2026-11-18
Status: Approved (brainstorming session)
Owner: My Homestay (Indah Morib) web app — Next.js, Supabase, next-intl (ms default, en)

## Goal

Replace Billplz as the main booking payment path with a WhatsApp confirmation flow.
Keep the Billplz flow intact but dormant. Staff keep working in a OneDrive Excel
sheet; a two-way sync keeps it aligned with Supabase.

## Key decisions (locked)

- New WhatsApp flow is the only path in the UI. All Billplz code
  (`/api/checkout`, `/api/callback`, `/api/booking-status`, `/api/cron/reconcile-payments`,
  `app/[locale]/success`, related translations) stays in the repo, dormant, untouched.
  No env flag.
- Booking is deposit-free at booking time; a booking is a 24-hour hold until staff
  confirm on WhatsApp.
- Record is stored in Supabase (`payment_status: 'pending'`). Excel is the staff
  editing/confirming surface. One-way UI: web app never reads Excel; Excel reads/writes
  via admin-triggered sync only.
- Calendar availability: confirmed/paid = solid grey (blocks booking). pending = faint
  tentative, does NOT block; other guests can book the same dates. First to deposit wins.
- Locale: Malay default; English for non-Malaysia guests.
- IC number is dropped everywhere — form field, submit payload, DB writes in the new
  path, WhatsApp message. (Billplz code dormant with its own payload untouched.)
- Microsoft Graph via delegated personal-account (MSA) auth; refresh token encrypted
  server-side; sync triggered manually in admin panel. No cron.
- x402/agent-payment gateway for premium content pages (packages, restaurants, holiday
  spots) is explicitly out of scope — deferred by owner.
- Customer cancellation is staff-mediated (WhatsApp); no self-service cancel.
- T&C rendered inside the booking modal; standard homestay wording, approved.

## Architecture

```
Guest (BookingModal)
  → POST /api/booking-create   (new; service-role insert, status='pending', price verified server-side)
  → sessionStorage('booking_sent', { payload })
  → router.push('/booking-sent')
/booking-sent
  → renders summary + WhatsApp button (wa.me/601157572001, locale message via lib/whatsapp.ts)
  → (no network read; sessionStorage or generic fallback)
Admin (finest-touch → BookingsPanel)
  → "Sync Excel" button → POST /api/admin/sync-excel
       1. load sync_credentials, refresh token if expired
       2. read Excel via Graph /workbook range API
       3. push Supabase→Excel (append new rows, update stale hash rows)
       4. pull Excel→Supabase — excel owns { status, notes, deposit } only; Excel wins
       5. conflicts logged to sync_conflicts (old Supabase values preserved)
       6. returns { pushed, pulled, conflicts, warnings }
Calendar/availability
  → block = payment_status in ('paid','confirmed'); pending rows shown faint (tentative)
  → pending older than 24h treated as expired (lazy age check, no job)
```

## Data model changes

`bookings.payment_status` vocabulary (free text column, no migration):
`pending` | `confirmed` | `cancelled` (new flow); `awaiting_payment` | `paid` | `failed` (dormant Billplz).

New columns on `bookings`:
- `excel_synced_at timestamptz null`
- `excel_row_ref int null` (1-based row index in the Excel table)
- `excel_hash text null` (sha256 of owned, synced fields)

New table `sync_credentials` (singleton row, provider = 'graph'):
`refresh_token_enc`, `access_token_enc`, `expires_at timestamptz`, `updated_at`, `account_upn text`.

New table `sync_conflicts`:
`id`, `booking_id`, `excel_values jsonb`, `supabase_values jsonb`, `created_at timestamptz default now()`, `resolved_at timestamptz null`.

Helper/index: index on `bookings(payment_status)` if absent. Final SQL in `add_whatsapp_sync.sql`.

## Sheet contract (until staff Excel is provided)

Assumed columns: `ID, Guest, Phone, Unit, Room, Check-in, Check-out, Package, Units,
Total, Status, Deposit, Notes, Created`. A `ID` column is required for two-way sync;
on first sync it is added if missing. Rows with an ID matching Supabase are synced;
rows without one are returned as warnings (never silently modified). If the staff sheet
differs, the push/pull adapters adapt — the ID-join and owned-fields rules do not change.

Status labels map case-insensitively (trim + lower):
`pending|booked|baru` → pending; `confirmed|sah|deposit paid|paid` → confirmed;
`cancelled|batal|cancel` → cancelled. Unknown labels → warning, cell untouched.

## Sync algorithm (full)

1. Admin session + role check (existing finest-touch guard from `/api/bookings`).
2. Acquire Graph token: if no credentials → 400 "Connect Microsoft first". Refresh if
   expired or on 401 once. On refresh failure: delete sync_credentials row, return
   401-shaped payload instructing re-connect.
3. Read headers + rows: `GET /me/drive/items/{itemId}/workbook/worksheets('Book1')/usedRange`
   (item id, worksheet name stored in sync_credentials after one-time connect + sheet probe).
   All Graph errors → 502, nothing applied.
4. Push:
   - bookings with no `excel_row_ref` → append (cost: one row write each).
   - Only Supabase-side fields changed → irrelevant for pull (push already handled).
   - `excel_hash` in `bookings` = sha256 of the owned tuple `{status, notes, deposit}`;
     it is never used for the informational cells (guest/room/dates are append-once).
   - `excel_synced_at` + `excel_row_ref` updated on every write to that row.
5. Pull: for each Excel row with known ID, hash owned fields `{status, notes, deposit}`:
   - Excel-stale, Supabase changed → skip (Supabase wins this round, push already applied).
   - Excel changed only → apply to Supabase, refresh hash + `excel_synced_at`.
   - Both changed → write Supabase values to `sync_conflicts`, apply Excel to Supabase.
6. Lazy expiry: any `pending` booking with `created_at < now() - interval '24 hours'`
   renders/behaves as expired (excluded from blocking and faint display). No DB sweep;
   optional `expired` status write deferred.
7. Response: `{ pushed, pulled, conflicts, warnings[] }` shown to admin as inline summary.

## Guest flow details

- BookingModal: remove IC input (all locales), change CTA label to booking CTA,
  render T&C block inline above CTA (approved bullets), submit handler switched to
  POST `/api/booking-create`.
- `/api/booking-create`: revalidate price server-side (`calculatePrice`), overlap check
  switched to block on (`paid`,`confirmed`) — pending does NOT block. Insert row status
  `pending`; return `{ id }`. Note: keep `/api/checkout` untouched and unreachable from
  UI.
- Calendar components (`RoomsSection`, `BookingCalendar`, modal's unavailable-units
  check) switch blocking filter to paid+confirmed; pending rows: amber 20% overlay +
  helper text (ms: "Tarikh ini telah ditempah tetapi masih berpotensi — pelanggan pertama
  yang bayar deposit mendapat tarikh" / en: "Date taken by another guest, but still open —
  first to deposit gets it").
- `/booking-sent`: no PII unless sessionStorage present; summary card (room, unit,
  dates+times, package, total, 24h hold notice); WhatsApp button wa.me/601157572001
  with pre-filled locale-aware message; "Back to home" link.
- `lib/whatsapp.ts`: `buildBookingMessage(payload, locale)` — pure function, unit-tested.
- i18n keys added to `messages/ms.json`, `messages/en.json` (button, T&C bullets,
  hold notice, tentative warning, booking-sent strings). ms default is already site default.

## Microsoft auth + token storage

- Azure app registration: account type "Accounts in any organizational directory and
  personal Microsoft accounts (AzureADandPersonalMicrosoftAccount)".
- Redirect URI: `<NEXT_PUBLIC_BASE_URL>/api/auth/graph/callback`.
- Delegated scopes: `User.Read Files.ReadWrite offline_access`.
- Flow: `/api/auth/graph` (redirect to Microsoft login, state nonce) →
  `/api/auth/graph/callback` (code exchange, token encrypt-at-rest AES-256-GCM with
  `SYNC_TOKEN_ENCRYPTION_KEY` env) → single `sync_credentials` row. Disconnect endpoint:
  delete row + attempt revoke. Admin sees "Microsoft: Connected (account)" pill + disconnect.
- Env var: `SYNC_TOKEN_ENCRYPTION_KEY` (32-byte hex, documented in SPEC + deploy docs).
- Item ID + worksheet name resolved once during connect via `GET /me/drive/root` probes
  for known filename (or stored from an admin config paste) — exact mechanism fixed at
  implementation time; stored in `sync_credentials`.

## Admin UX

- BookingsPanel header: "Sync Excel" button (owner/finest-touch role only). Result
  inline summary: pushed N, pulled M, conflicts K (with link to a conflicts drawer or
  plain list; conflicts resolve by re-editing Excel and re-syncing).
- Status dropdown gains new semantics; old values retained for Billplz rows.

## Errors & edges

- Graph down/rate-limited: 502 response, no rows applied server-side, admin retries.
  All push/pull operations keyed by ID + hash → idempotent retry is safe.
- Excel edited on two different rows concurrently: independent rows, no interaction.
- Expired pending slot: next deposit-paying guest proceeds regardless; staff resolves
  competing pendings by deposit order.
- Missing IC no longer collected → nothing breaks in admin views (admin never displayed
  IC to guests; billplz path unchanged).

## Testing

- `lib/whatsapp.ts`: message contains name/room/dates/total/ID; no IC; correct locale
  selection.
- Status-label mapper: ms/en variants, unknown labels.
- Expiry age helper: boundary at 24h.
- Sync integration: mocked `fetch` for Graph — append path, stale-row update, both-changed
  conflict path, unknown-label warning path.
- Manual UAT matrix: create booking → faint slot → confirm via Excel edit + sync → slot
  solid; cancel via Excel + sync → slot free; WhatsApp deep link opens with correct text;
  `/success` still renders Billplz flow path (dummy) when reactivated.

## Out of scope

- x402 / agent-payment gateway for premium content pages (deferred by owner).
- Cron/background sync (button-only by decision).
- Self-service customer cancellation (staff-mediated by decision).
- Pulling price/dates/guest fields from Excel (status/notes/deposit only).
- Deleting or retiring Billplz code.
- Final Excel column mapping — fitted when staff's file is available.

## Open items at implementation time

1. Staff Excel design (sheet name, exact headers, status wording style — BM vs EN).
2. ENCRYPTION_KEY provisioning in Vercel + local `.env.local`.
3. Azure app registration (owner action required; steps documented in IMPLEMENTATION plan).
