import type { Metadata } from "next";
import RootShell from "@/components/RootShell";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Finest Touch | Indah Morib Homestay", template: "%s | Indah Morib Homestay" },
  robots: { index: false, follow: false },
};

// Root layout for the /finest-touch admin, which sits outside the locale routes.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="ms">{children}</RootShell>;
}
