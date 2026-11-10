"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const t = useTranslations("Success");
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    // Billplz typically appends billplz[id] and billplz[paid]
    const billId = searchParams.get("billplz[id]");

    useEffect(() => {
        async function verifyStatus() {
            if (!billId) {
                setStatus("failed");
                return;
            }

            // Confirmation is verified server-side against Billplz. The client no
            // longer touches the bookings table directly (payment status is owned
            // by the signed webhook), so guest PII is never exposed to the anon key.
            try {
                const res = await fetch("/api/booking-status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ billId }),
                });
                const result = await res.json();

                if (res.ok && result.status === "success") {
                    if (result.booking) setBookingDetails(result.booking);
                    setStatus("success");
                } else {
                    setStatus("failed");
                }
            } catch (error) {
                console.error("Payment verification failed:", error);
                setStatus("failed");
            }
        }

        verifyStatus();
    }, [billId]);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                    <p className="font-medium text-[var(--text-muted)]">{t("verifying")}</p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
                <div className="animate-scale-in max-w-2xl w-full bg-[var(--surface-raised)] p-10 lg:p-12 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)]">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--success)] text-[var(--success)]">
                        <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 className="text-display mb-4 text-4xl">{t("confirmed")}</h1>
                    <p className="mb-8 text-lg text-[var(--text-muted)]">
                        {t.rich("thanks", {
                            name: bookingDetails?.guest_name || "",
                            room: bookingDetails?.rooms?.title || t("ourHomestay"),
                            b: (c) => <span className="text-[var(--accent)] font-bold">{c}</span>,
                        })}
                    </p>

                    {bookingDetails && (
                        <div className="mb-8 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border-strong)] p-6 flex flex-col items-center">
                            <span className="font-bold text-[var(--danger)] mb-2 text-sm">{t("actionRequired")}</span>
                            <p className="text-sm text-[var(--text-muted)] font-medium mb-4">{t("actionBody")}</p>
                            <a
                                href={`https://wa.me/601157572001?text=${encodeURIComponent(
                                    `*SUCCESS BOOKING!*\n\n*Homestay:* ${bookingDetails.rooms?.title || 'Our Homestay'}\n*Unit:* ${bookingDetails.unit_name || 'N/A'}\n*Name:* ${bookingDetails.guest_name}\n*Phone number:* ${bookingDetails.guest_email}\n*Date:* ${bookingDetails.check_in} to ${bookingDetails.check_out}\n*Package details:* ${bookingDetails.package_name}\n*Price:* RM${bookingDetails.total_price}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary whatsapp-button w-full sm:w-auto"
                            >
                                <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                {t("sendWa")}
                            </a>
                        </div>
                    )}

                    {bookingDetails && (
                        <div className="mb-10 grid grid-cols-2 gap-4 rounded-[var(--radius-md)] bg-[var(--background)] p-6 text-left border border-[var(--border)]">
                            <div>
                                <p className="text-sm text-[var(--text-muted)] mb-1">{t("checkIn")}</p>
                                <p className="font-bold text-[var(--primary)]">{bookingDetails.check_in}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-muted)] mb-1">{t("checkOut")}</p>
                                <p className="font-bold text-[var(--primary)]">{bookingDetails.check_out}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="btn-primary flex-1">
                            {t("backHome")}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
            <div className="animate-scale-in max-w-xl w-full bg-[var(--surface-raised)] p-10 lg:p-12 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--border)]">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--danger)] text-[var(--danger)]">
                    <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </div>
                <h1 className="text-display mb-4 text-4xl">{t("failed")}</h1>
                <p className="mb-10 text-lg text-[var(--text-muted)]">
                    {t("failedBody")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/#rooms" className="btn-primary flex-1">
                        {t("retry")}
                    </Link>
                    <Link href="/" className="btn-outline flex-1">
                        {t("cancel")}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    );
}
