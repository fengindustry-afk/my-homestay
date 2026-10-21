"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const VERT = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/**
 * Domain-warped FBM lit as underwater caustics. The compound is built around
 * pools and the river, so the background is light moving through water rather
 * than generic noise.
 */
const FRAG = `
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uBase;
uniform vec3  uDeep;
uniform vec3  uGlow;
uniform float uIntensity;
uniform float uLight;   // 0 = dark theme, 1 = light theme

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
  float t = uTime * 0.05;

  // Two warp passes give the field parallax depth: near ripples read as
  // travelling faster than the far ones.
  vec2 q = vec2(fbm(p * 1.2 + vec2(0.0, t)),
                fbm(p * 1.2 + vec2(5.2, 1.3) - t * 0.5));
  vec2 r = vec2(fbm(p * 1.2 + 2.4 * q + vec2(1.7, 9.2) + t * 0.35),
                fbm(p * 1.2 + 2.4 * q + vec2(8.3, 2.8) - t * 0.28));
  float f = fbm(p * 1.2 + 2.4 * r);

  // Ridged sine of the field -> the thin bright filaments caustics make.
  float caustic = abs(sin(f * 6.2831 + t * 1.6));
  caustic = pow(caustic, 4.0) * uIntensity;

  float depth = clamp(f * 1.5, 0.0, 1.0);
  float sheen = pow(clamp(length(r), 0.0, 1.0), 3.0);
  // Radial falloff keeps the centre readable for overlaid text.
  float vig = 1.0 - smoothstep(0.4, 1.6, length(p));

  vec3 col;

  if (uLight < 0.5) {
    // Dark: you are looking at light in a dark room, so the caustics emit.
    // Additive, and the vignette darkens toward the edges to give depth.
    col = mix(uBase, uDeep, depth);
    col += uGlow * caustic;
    col += uGlow * sheen * 0.35 * uIntensity;
    col *= 0.55 + 0.45 * vig;
  } else {
    // Light: the same water lit from above onto a pale floor. Here caustics
    // are read as *shading*, not emission — bright lanes against warm shade.
    // Every step is a mix rather than an add: adding light to an already-pale
    // ground just clips to white and flattens the filaments into mush, which
    // is exactly what the additive model above does if you only lighten its
    // colours. Mixing keeps every value in range, so the fine structure of
    // the field survives.
    // Coefficients tuned by rendering frames and measuring the pixels: the
    // gentler first pass produced a 12/255 tonal range, which is technically
    // unclipped and visually nothing. These give ~31 in the hero and ~43 in
    // the CTA, with highlight clipping (~7%) close to the dark model's ~9% —
    // blown-out caustic lanes are correct, a blown-out frame is not.
    col = mix(uBase, uDeep, depth);
    col = mix(col, uGlow, clamp(caustic * 0.75, 0.0, 1.0));
    col = mix(col, uGlow, clamp(sheen * 0.26 * uIntensity, 0.0, 1.0));
    // Edges settle into the shade tone instead of the whole frame being
    // multiplied down, which on cream would read as grey dirt. Gentler than
    // the dark vignette because there is far less tonal room to play with.
    col = mix(uDeep, col, 0.80 + 0.20 * vig);
  }

  // Dithering. Without it, wide dark gradients band badly on 8-bit displays.
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
`;

/** "#1a2318" | "rgb(26,35,24)" -> [r,g,b] in 0..1. */
function parseColor(input: string, fallback: [number, number, number]): [number, number, number] {
    const value = input.trim();

    const hex = value.match(/^#?([\da-f]{6})$/i);
    if (hex) {
        const n = parseInt(hex[1], 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }

    const rgb = value.match(/rgba?\(([^)]+)\)/i);
    if (rgb) {
        const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        if (parts.length >= 3 && parts.slice(0, 3).every((n) => !Number.isNaN(n))) {
            return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
        }
    }

    return fallback;
}

interface ShaderBackgroundProps {
    /** Caustic brightness. Hero carries more than a mid-page band. */
    intensity?: number;
    className?: string;
}

/**
 * Full-bleed animated WebGL backdrop.
 *
 * Fails open in every direction: no WebGL, reduced-motion, offscreen, or a
 * hidden tab all fall back to something static and cheap rather than breaking
 * or burning battery. Whatever sits behind the canvas stays visible if the
 * context never initialises.
 */
export default function ShaderBackground({ intensity = 1, className }: ShaderBackgroundProps) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let renderer: Renderer;
        try {
            renderer = new Renderer({
                alpha: false,
                antialias: false,
                // Caps cost on phones; the field is soft enough that the
                // resolution loss is invisible.
                dpr: Math.min(window.devicePixelRatio || 1, 1.5),
            });
        } catch {
            return; // No WebGL. The CSS behind the canvas carries the section.
        }

        const gl = renderer.gl;
        const canvas = gl.canvas as HTMLCanvasElement;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        host.appendChild(canvas);

        const readVar = (name: string, fallback: [number, number, number]) => {
            const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
            return parseColor(raw, fallback);
        };

        // Selects the lighting model, not just the palette — see the shader.
        const isLight = () => (document.documentElement.classList.contains("light") ? 1 : 0);

        const program = new Program(gl, {
            vertex: VERT,
            fragment: FRAG,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [1, 1] },
                uBase: { value: readVar("--shader-base", [0.04, 0.06, 0.05]) },
                uDeep: { value: readVar("--shader-deep", [0.08, 0.13, 0.11]) },
                uGlow: { value: readVar("--shader-glow", [0.83, 0.66, 0.31]) },
                uIntensity: { value: intensity },
                uLight: { value: isLight() },
            },
        });

        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = host;
            if (!w || !h) return;
            renderer.setSize(w, h);
            program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();

        // Declared up here because the theme observer below reads it, and that
        // observer stays live on the reduced-motion path where the animation
        // loop is never set up.
        let onScreen = true;

        // Re-read tokens and swap the lighting model when next-themes changes
        // the class on <html>.
        const themeObserver = new MutationObserver(() => {
            program.uniforms.uBase.value = readVar("--shader-base", [0.04, 0.06, 0.05]);
            program.uniforms.uDeep.value = readVar("--shader-deep", [0.08, 0.13, 0.11]);
            program.uniforms.uGlow.value = readVar("--shader-glow", [0.83, 0.66, 0.31]);
            program.uniforms.uLight.value = isLight();
            // Nothing is drawing in these two states, so paint the change now.
            if (reduced || !onScreen) renderer.render({ scene: mesh });
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        if (reduced) {
            // One frame, no loop: the depth and colour survive, the motion doesn't.
            renderer.render({ scene: mesh });
            return () => {
                resizeObserver.disconnect();
                themeObserver.disconnect();
                canvas.remove();
                gl.getExtension("WEBGL_lose_context")?.loseContext();
            };
        }

        let frame = 0;
        let last = performance.now();
        let elapsed = 0;

        const loop = (now: number) => {
            frame = requestAnimationFrame(loop);
            // Advance by real delta so a backgrounded tab doesn't jump on return.
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            elapsed += dt;
            program.uniforms.uTime.value = elapsed;
            renderer.render({ scene: mesh });
        };

        const start = () => {
            if (frame) return;
            last = performance.now();
            frame = requestAnimationFrame(loop);
        };
        const stop = () => {
            cancelAnimationFrame(frame);
            frame = 0;
        };

        // Scrolled past = no reason to keep a GPU loop running.
        const visibility = new IntersectionObserver(
            ([entry]) => {
                onScreen = entry.isIntersecting;
                if (onScreen && !document.hidden) start();
                else stop();
            },
            { threshold: 0 }
        );
        visibility.observe(host);

        const onVisibilityChange = () => {
            if (document.hidden) stop();
            else if (onScreen) start();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        start();

        return () => {
            stop();
            resizeObserver.disconnect();
            themeObserver.disconnect();
            visibility.disconnect();
            document.removeEventListener("visibilitychange", onVisibilityChange);
            canvas.remove();
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [intensity]);

    return <div ref={hostRef} aria-hidden="true" className={className} />;
}
