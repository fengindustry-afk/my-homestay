import Link from "next/link";

export default function SuccessPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
            <div className="animate-scale-in">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 className="mb-2 text-4xl font-bold text-[var(--primary)] uppercase tracking-tight">Booking Successful!</h1>
                <p className="mb-10 text-lg text-[var(--text-muted)] max-w-md mx-auto">
                    Thank you for choosing Serenity Homestay. Your reservation has been confirmed. A receipt has been sent to your email.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center font-bold">
                    <Link href="/" className="btn-primary">
                        Back to Home
                    </Link>
                    <Link href="/#rooms" className="px-8 py-3.5 border-2 border-[var(--primary)] text-[var(--primary)] rounded-md hover:bg-[var(--primary)] hover:text-white transition-all uppercase text-sm tracking-widest">
                        View More Rooms
                    </Link>
                </div>
            </div>
        </div>
    );
}
