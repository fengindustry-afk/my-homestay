"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

// Registered once, on the client only. Every GSAP consumer imports from here
// so plugin registration never drifts between components.
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
}

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const REDUCED = "(prefers-reduced-motion: reduce)";

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
