import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link and hooks. Use these instead of next/link for public pages.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
