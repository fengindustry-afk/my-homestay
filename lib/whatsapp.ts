import { waLink } from './site.ts';

export type WhatsAppBookingPayload = {
  id: number | null;
  roomTitle: string;
  unitName: string | null;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  packageName: string;
  unitsCount: number;
  totalPrice: number;
};

export function buildBookingMessage(p: WhatsAppBookingPayload, locale: string): string {
  const ms = locale.startsWith('ms');
  const id = p.id == null ? 'DRAFT' : String(p.id);
  const room = p.unitName ? `${p.roomTitle} (${p.unitName})` : p.roomTitle;
  const total = `RM${Math.round(p.totalPrice)}`;

  if (ms) {
    return [
      '*TEMPAHAN BARU — MENUNGGU DEPOSIT*',
      `ID Tempahan: ${id}`,
      `Bilik: ${room}`,
      `Nama: ${p.guestName}`,
      `Telefon: ${p.guestPhone}`,
      `Daftar masuk: ${p.checkIn} ${p.checkInTime}`,
      `Daftar keluar: ${p.checkOut} ${p.checkOutTime}`,
      `Pakej: ${p.packageName}`,
      `Unit: ${p.unitsCount}`,
      `Jumlah: ${total}`,
      'Status: Menunggu deposit (dipegang 24 jam)',
    ].join('\n');
  }

  return [
    '*NEW BOOKING — PENDING*',
    `Booking ID: ${id}`,
    `Room: ${room}`,
    `Name: ${p.guestName}`,
    `Phone: ${p.guestPhone}`,
    `Check-in: ${p.checkIn} ${p.checkInTime}`,
    `Check-out: ${p.checkOut} ${p.checkOutTime}`,
    `Package: ${p.packageName}`,
    `Units: ${p.unitsCount}`,
    `Total: ${total}`,
    'Status: Pending deposit (held 24h)',
  ].join('\n');
}

export function buildWhatsAppLink(p: WhatsAppBookingPayload, locale: string): string {
  return waLink(buildBookingMessage(p, locale));
}
