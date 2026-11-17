"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppLink, WhatsAppBookingPayload } from "@/lib/whatsapp";

type StoredPayload = WhatsAppBookingPayload & { totalPrice?: number; locale?: string };

export default function BookingSentPage() {
  const t = useTranslations("BookingSent");
  const [payload, setPayload] = useState<StoredPayload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("booking_sent");
      if (raw) setPayload(JSON.parse(raw) as StoredPayload);
    } catch {
      setPayload(null);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
        <div className="animate-scale-in max-w-xl w-full bg-[var(--surface-raised)] p-10 lg:p-12 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)]">
          <h1 className="font-display mb-4 text-4xl font-normal text-[var(--primary)]">{t("titleGeneric")}</h1>
          <p className="mb-8 text-lg text-[var(--text-muted)]">{t("bodyGeneric")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/601157572001"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[44px] bg-[#25D366] hover:bg-[#1ebd5a] transition-all text-white py-3 px-8 rounded-full font-semibold flex items-center justify-center gap-3"
            >
              {t("sendWa")}
            </a>
            <Link href="/" className="btn-primary flex-1 py-4 justify-center font-bold">
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const locale = payload.locale || "ms";
  const waUrl = buildWhatsAppLink(payload, locale);
  const roomLabel = payload.unitName ? `${payload.roomTitle} (${payload.unitName})` : payload.roomTitle;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
      <div className="animate-scale-in max-w-2xl w-full bg-[var(--surface-raised)] p-10 lg:p-12 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)]">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--success)] text-[var(--success)]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-display mb-4 text-4xl font-normal text-[var(--primary)]">{t("title")}</h1>
        <p className="mb-8 text-lg text-[var(--text-muted)]">{t("body")}</p>

        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-[var(--radius-md)] bg-[var(--background)] p-6 text-left border border-[var(--border)]">
          <div className="sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Booking</p>
            <p className="font-bold text-[var(--primary)]">{roomLabel} · #{payload.id ?? "DRAFT"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Check-in</p>
            <p className="font-bold text-[var(--primary)]">{payload.checkIn} {payload.checkInTime}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Check-out</p>
            <p className="font-bold text-[var(--primary)]">{payload.checkOut} {payload.checkOutTime}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Package</p>
            <p className="font-bold text-[var(--primary)]">{payload.packageName} · {payload.unitsCount} unit</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Total</p>
            <p className="font-bold text-[var(--primary)]">RM{Math.round(payload.totalPrice ?? 0)}</p>
          </div>
        </div>

        <p className="mb-6 text-sm font-medium text-[var(--accent)]">{t("holdNote")}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[44px] bg-[#25D366] hover:bg-[#1ebd5a] transition-all text-white py-3 px-8 rounded-full font-semibold flex items-center justify-center gap-3"
          >
            {t("sendWa")}
          </a>
          <Link href="/" className="btn-primary flex-1 py-4 justify-center font-bold">
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
