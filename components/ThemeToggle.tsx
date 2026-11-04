"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="theme-toggle relative flex h-11 w-11 items-center justify-center rounded-full transition-all">
                <span className="sr-only">Toggle theme</span>
            </button>
        );
    }

    const isDark = resolvedTheme === "dark" || theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="theme-toggle relative flex h-11 w-11 items-center justify-center rounded-full transition-all"
        >
            <Moon
                className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"}`}
            />
            <Sun
                className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"}`}
            />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
