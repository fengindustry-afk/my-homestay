# OneDrive Excel Sync Setup (WhatsApp Booking Flow)

Manual, staff-triggered two-way sync between Supabase `bookings` and a staff-managed Excel workbook in OneDrive (Microsoft personal account / MSA via delegated Graph auth).

## 1. Azure app registration

Create an app in [Microsoft Entra admin center](https://entra.microsoft.com/) → **App registrations** → **New registration**.

- **Name:** `Indah Morib Booking Sync` (or similar)
- **Supported account types:** `Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)`  
  (required for personal MSA OneDrive; app uses `common` authority)
- **Redirect URI (Web):** `https://<your-production-domain>/api/auth/graph/callback`  
  For local testing add `http://localhost:3000/api/auth/graph/callback` (if used) and set `NEXT_PUBLIC_BASE_URL` accordingly.
- **API permissions (delegated, Microsoft Graph):**
  - `Files.ReadWrite` (read/write staff workbook in signed-in user's OneDrive)
  - `User.Read`
  - `offline_access` (refresh token for long-lived sync)
  Grant admin consent not required for personal MSA delegated flow in typical cases, but user must consent on first connect.
- **Certificates & secrets:** create a **Client secret**; copy its **Value** immediately.

Record:
- `MICROSOFT_CLIENT_ID` = Application (client) ID
- `MICROSOFT_CLIENT_SECRET` = client secret value

## 2. Token encryption key

Generate a 32-byte (64 hex chars) key for AES-256-GCM at-rest encryption of Graph tokens in `sync_credentials`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set in both:
- **Vercel env** (Production/Preview as needed): `SYNC_TOKEN_ENCRYPTION_KEY=<64-hex>`
- **Local `.env.local`**: `SYNC_TOKEN_ENCRYPTION_KEY=<64-hex>`

Never commit this key.

## 3. Excel workbook in OneDrive

1. Upload the staff `.xlsx` to the **same Microsoft account** that will connect in the admin panel.
2. Ensure the worksheet has a header row with the required columns (see contract below). Keep it A1-anchored (no blank leading title rows above headers) so `usedRange` row mapping is stable.
3. Get the Drive **item id** via [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer) (signed in as that account):

   `GET https://graph.microsoft.com/v1.0/me/drive/root:/<path-to-file.xlsx>:/?$select=id,name`

   Example: `/me/drive/root:/Bookings/indah-morib-bookings.xlsx:`

4. Set env vars:
   - `SYNC_EXCEL_ITEM_ID=<item id from Graph>`
   - `SYNC_EXCEL_WORKSHEET=Book1` (or your sheet/tab name; must match exactly)

Also set:
- `NEXT_PUBLIC_BASE_URL=https://<your-domain>` (used for OAuth redirect/callback)

## 4. Database migration

Run `add_whatsapp_sync.sql` in the **Supabase SQL editor** before using sync:

- Adds `bookings.excel_synced_at`, `excel_row_ref`, `excel_hash`
- Adds `sync_credentials`, `sync_conflicts`
- Adds index on `bookings(payment_status)`

Migration is idempotent.

## 5. Connect and first sync

1. Open admin panel (`/finest-touch`) as staff/admin.
2. Click **Connect** (Microsoft) and complete consent with the OneDrive owner account.
3. Click **Sync Excel**.
4. Expected first-sync behavior:
   - Existing/new DB bookings without `excel_row_ref` are appended to Excel (`pushed` count).
   - Rows with missing/invalid IDs in Excel are reported as warnings (sync continues).
   - If sheet is missing required columns, sync returns `sheet_missing_columns`.

## 6. Sheet column contract

Required header columns (case/spacing tolerant; aliases supported: `check in`/`checkin` → `check-in`, `pkg` → `package`):

`id, guest, phone, unit, room, check-in, check-out, package, units, total, status, deposit, notes, created`

**Required for sync logic:** `id, guest, check-in, check-out, status, deposit, notes, created` (others recommended for staff context).

Append writes use canonical A–N order:
`id, guest, phone, unit, room, check-in, check-out, package, units, total, status, deposit, notes, created`

## 7. Status label mapping

| Excel label (examples) | Normalized DB status |
|---|---|
| `Pending`, `Booked`, `Baru` | `pending` |
| `Confirmed`, `Sah`, `Deposit paid`, `Paid` | `confirmed` |
| `Cancelled`, `Batal`, `Cancel` | `cancelled` |

DB → Excel display:
- `pending` / `awaiting_payment` → `Pending`
- `paid` / `confirmed` → `Confirmed`
- `failed` / `cancelled` → `Cancelled`

**Sync ownership:** only `status`, `deposit` (`amount_paid`), `notes` (`admin_notes`) are two-way. Other fields are pushed on append only; staff edits to them in Excel are not pulled.

## 8. Conflict and safety behavior

- Excel wins on pull/conflict for owned fields.
- `both-changed` since last sync: apply Excel values, increment conflict count, insert row in `sync_conflicts` with before-values snapshots.
- `storedHash` null (never synced): treated as `db-only` baseline to seed hash safely.
- Rows with empty/non-numeric/unknown IDs: warned and skipped (no crash).
- Pending holds: 24h in app logic; expired holds do not block availability (UI shows tentative only when active).

## 9. Env var checklist

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `SYNC_EXCEL_ITEM_ID`
- `SYNC_EXCEL_WORKSHEET`
- `SYNC_TOKEN_ENCRYPTION_KEY`
