"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // Public pages are light only, even if a visitor saved "dark" earlier.
    // The /finest-touch admin keeps its theme toggle.
    const forcedTheme = usePathname()?.startsWith("/finest-touch") ? undefined : "light";
    return <NextThemesProvider {...props} forcedTheme={forcedTheme}>{children}</NextThemesProvider>;
}
