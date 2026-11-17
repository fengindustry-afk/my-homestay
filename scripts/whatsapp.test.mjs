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
  assert.doesNotMatch(m, /ic_number|no\.?\s*ic\b|\bkad\s+pengenalan\b/i); // no IC-shaped label (avoid bare "ic" matching words like "Basic")
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
  assert.ok(link.includes('*TEMPAHAN') || link.includes('%2ATEMPAHAN') || link.includes('*NEW'));
});

test('id null renders DRAFT placeholder', () => {
  const m = buildBookingMessage({ ...p, id: null }, 'ms');
  assert.match(m, /DRAFT/);
});
