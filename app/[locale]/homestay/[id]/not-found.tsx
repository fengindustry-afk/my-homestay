"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomestayNotFound() {
  const t = useTranslations("NotFound");
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-display" style={{ fontSize: "2.25rem" }}>
        {t("roomTitle")}
      </h1>
      <p style={{ color: "var(--text-muted)" }}>
        {t("roomBody")}
      </p>
      <Link href="/" className="btn-primary">
        {t("home")}
      </Link>
    </div>
  );
}
