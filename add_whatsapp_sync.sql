-- WhatsApp booking flow + OneDrive Excel sync (idempotent)
-- Run in Supabase SQL editor before deploy.

alter table bookings add column if not exists excel_synced_at timestamptz;
alter table bookings add column if not exists excel_row_ref int;
alter table bookings add column if not exists excel_hash text;

create index if not exists idx_bookings_payment_status on bookings(payment_status);

create table if not exists sync_credentials (
  id bigserial primary key,
  provider text unique not null default 'graph',
  refresh_token_enc text,
  access_token_enc text,
  expires_at timestamptz,
  account_upn text,
  item_id text,
  worksheet text,
  updated_at timestamptz default now()
);

create table if not exists sync_conflicts (
  id bigserial primary key,
  booking_id bigint references bookings(id) on delete cascade,
  excel_values jsonb,
  supabase_values jsonb,
  created_at timestamptz default now(),
  resolved_at timestamptz
);
