import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Indah Morib Homestay: Your Home Away From Home",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePageClient />;
}
