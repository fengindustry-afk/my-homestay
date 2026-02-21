"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    // Billplz typically appends billplz[id] and billplz[paid]
    const billId = searchParams.get("billplz[id]");
    const isPaid = searchParams.get("billplz[paid]") === "true";

    useEffect(() => {
        async function verifyStatus() {
            if (!billId) {
                setStatus("failed");
                return;
            }

            if (isPaid) {
                // 1. Mark as paid immediately in the UI/DB as a fast-track update
                const { data, error: updateError } = await supabase
                    .from("bookings")
                    .update({ payment_status: "paid" })
                    .eq("billplz_id", billId)
                    .select("*, rooms(title)")
                    .single();

                if (updateError) {
                    console.error("Fast-track update error:", updateError);
                    // If update fails but it was paid according to URL, we still show success
                    // but we might not have booking details.
                }

                if (data) setBookingDetails(data);
                setStatus("success");
            } else {
                setStatus("failed");
                // IMPORTANT: Delete the pending booking if it failed/was cancelled
                // to keep the database clean as requested ("booking slot should be empty")
                await supabase
                    .from("bookings")
                    .delete()
                    .eq("billplz_id", billId)
                    .eq("payment_status", "pending");
            }
        }

        verifyStatus();
    }, [billId, isPaid]);

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
                    <Link href="/" className="px-8 py-4 border-2 border-[var(--border)] text-[var(--primary)] rounded-xl hover:bg-gray-50 transition-all font-bold">
                        Home
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
