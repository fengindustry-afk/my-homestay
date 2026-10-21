import Link from "next/link";

export default function HomestayNotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-display" style={{ fontSize: "2.25rem" }}>
        Homestay not found
      </h1>
      <p style={{ color: "var(--text-muted)" }}>
        This listing may have been removed or the link is out of date.
      </p>
      <Link href="/" className="btn-primary">
        Return home
      </Link>
    </div>
  );
}
