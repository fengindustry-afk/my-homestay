"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentStatusContent() {
    const searchParams = useSearchParams();
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
                    <p className="font-medium text-[var(--text-muted)]">Verifying payment status...</p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
                <div className="animate-scale-in max-w-2xl w-full bg-white p-12 rounded-3xl shadow-2xl border border-[var(--border)]">
                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 className="mb-4 text-4xl font-black text-[var(--primary)] uppercase tracking-tight">Booking Confirmed!</h1>
                    <p className="mb-8 text-lg text-[var(--text-muted)]">
                        Thank you {bookingDetails?.guest_name || ""}, your stay at <span className="text-[var(--accent)] font-bold">{bookingDetails?.rooms?.title || "our homestay"}</span> is reserved.
                    </p>

                    {bookingDetails && (
                        <div className="mb-8 rounded-2xl bg-orange-50 border border-orange-200 p-6 flex flex-col items-center">
                            <span className="font-bold text-orange-600 mb-2 uppercase tracking-wide text-xs">Action Required</span>
                            <p className="text-sm text-orange-700 font-medium mb-4">You must push your booking details via WhatsApp to receive homestay access.</p>
                            <a
                                href={`https://wa.me/601157572001?text=${encodeURIComponent(
                                    `*SUCCESS BOOKING!*\n\n*Homestay:* ${bookingDetails.rooms?.title || 'Our Homestay'}\n*Unit:* ${bookingDetails.unit_name || 'N/A'}\n*Name:* ${bookingDetails.guest_name}\n*Phone number:* ${bookingDetails.guest_email}\n*Date:* ${bookingDetails.check_in} to ${bookingDetails.check_out}\n*Package details:* ${bookingDetails.package_name}\n*Price:* RM${bookingDetails.total_price}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebd5a] active:scale-95 transition-all text-white py-3 px-8 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-200"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                Send Booking Details to WhatsApp
                            </a>
                        </div>
                    )}

                    {bookingDetails && (
                        <div className="mb-10 grid grid-cols-2 gap-4 rounded-2xl bg-[var(--surface)] p-6 text-left border border-[var(--border)]">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Check In</p>
                                <p className="font-bold text-[var(--primary)]">{bookingDetails.check_in}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Check Out</p>
                                <p className="font-bold text-[var(--primary)]">{bookingDetails.check_out}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/" className="btn-primary flex-1 py-4 justify-center font-bold">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
            <div className="animate-scale-in max-w-xl w-full bg-white p-12 rounded-3xl shadow-2xl border border-red-100">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </div>
                <h1 className="mb-4 text-4xl font-black text-red-600 uppercase tracking-tight">Payment Failed</h1>
                <p className="mb-10 text-lg text-[var(--text-muted)]">
                    The transaction was cancelled or unsuccessful. The booking slot has been released. Please try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/#rooms" className="btn-dark flex-1 py-4 justify-center font-bold">
                        Retry Booking
                    </Link>
                    <Link href="/" className="px-8 py-4 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all font-bold flex-1 flex items-center justify-center">
                        Cancel and Go Back
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
