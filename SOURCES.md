# Design Sources — dark-luxury redesign

Provenance for the redesign of the public site (homepage + `/homestay/[id]`).
Every borrowed piece is traced to its origin and license so the next pass can
deepen a known foundation instead of starting over.

**Design Set:** *Premium Landing* (GSAP + Lenis + WebGL), adapted. The set
normally pairs Tailark/Aceternity blocks with the motion stack; those were
dropped because this project already had a coherent token system and component
CSS worth keeping. No component-library code was copied into this repo — the
libraries below are runtime dependencies, and every component is hand-written
against the existing `--token` system.

---

## Runtime dependencies

| Piece | Source | License | Usage | Notes |
|---|---|---|---|---|
| Scroll choreography, reveals, parallax | [greensock/GSAP](https://github.com/greensock/GSAP) + ScrollTrigger | **Custom "Standard no-charge" — NOT MIT** | Dependency | See below. Free to ship on this site. |
| Smooth scrolling | [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | MIT | Dependency | Driven off `gsap.ticker`, not its own RAF. |
| WebGL backgrounds | [oframe/ogl](https://github.com/oframe/ogl) | MIT | Dependency | Only `Renderer`, `Program`, `Mesh`, `Triangle` imported. Chosen over Three.js (~5x larger) and Vanta (preset backgrounds read as templated). |
| Icons | [lucide/lucide](https://github.com/lucide-icons/lucide) (`lucide-react`) | ISC | Dependency, pre-existing | Already in the project. |

### GSAP licensing — read before shipping commercially

GSAP is **free but not open source**. GreenSock retains all rights and grants a
no-charge license. Shipping it on this site is fine. It is *not* freely
redistributable or relicensable like MIT, and the license restricts using it to
build a competing product that is sold. Terms: <https://gsap.com/standard-license>

If that is ever a problem, the reveals and parallax could be rebuilt on
`IntersectionObserver` + CSS (which is what this site did before) at the cost of
the scrubbed parallax. Lenis and OGL are both MIT and unaffected.

---

## Original work

| Piece | File | Basis | Notes |
|---|---|---|---|
| Caustic shader | `components/ShaderBackground.tsx` | Original GLSL | Domain-warped fBm — the standard warping technique popularised by Inigo Quilez (<https://iquilezles.org/articles/warp/>), an article describing a method, not licensed code. Value-noise hash and the caustic ridge/dither pass are written for this project. Tied to the property's pools and river rather than being generic noise. **Two lighting models on one field** — see below. |
| Magnetic + ripple buttons | `components/ButtonFX.tsx`, `globals.css` | Original | One delegated document listener rather than a wrapper per button, so late-mounting buttons (Supabase cards, booking modal) are covered without opting in. JS only feeds coordinates via custom properties; CSS owns the visuals. |
| Attribute-driven motion | `components/ScrollFX.tsx` | Original | `data-reveal` / `data-stagger` / `data-parallax`. Includes a fail-open watchdog (see below). |
| Token system | `app/globals.css` | Original, evolved from existing | Dark is now `:root`; `.light` overrides. |

---

## Patterns adopted (no code copied)

| Pattern | Where | Origin |
|---|---|---|
| Stretched link card | `.room-card-link::after` | Long-established accessible pattern (Bootstrap ships it as `.stretched-link`; Heydon Pickering's *Inclusive Components* covers the rationale). Lets the whole card navigate while the Book button stays independently clickable, with no nested interactive elements. |
| Lenis ↔ ScrollTrigger wiring | `components/SmoothScroll.tsx` | Integration approach documented by both projects: `lenis.on('scroll', ScrollTrigger.update)` + drive `lenis.raf` from `gsap.ticker` + `lagSmoothing(0)`. |

## Visual reference

**Elyse Residence** — <https://www.awwwards.com/sites/elyse-residence> — dark
charcoal luxury real estate, fullscreen imagery, scroll-led. **Inspiration only.**
It is a Webflow site; no code was taken, and none could be. What was taken is the
temperature: dark ground, photography carrying the page, restrained gold.

Deliberate departures: this site keeps an asymmetric split hero (a centred hero
is the most common templated default), numbered section indices (`01 / About`)
borrowed from architectural portfolio convention, and testimonial cards that size
to their own content rather than stretching to a uniform grid.

---

## Decisions worth knowing next time

- **Dark by default** (`:root`), light via `.light`. Reversing it would flash
  cream on every load, because next-themes can only set the class after
  hydration and `:root` is what SSR ships.
- **`html { overflow-x: hidden }`** is load-bearing. `overflow-x: clip` is the
  better primitive but Lightning CSS silently strips it at this project's browser
  targets — verified by inspecting the served CSS.
- **The reveal watchdog** in `ScrollFX.tsx` exists because `gsap.from()` fails
  *closed*: it hides elements immediately and only restores them when a trigger
  fires. Without the sweep, an rAF-starved tab or a thrown error leaves room
  listings permanently invisible. Do not remove it without replacing the
  guarantee.
- **Contrast was measured, not eyeballed.** Both themes clear WCAG AA (4.5:1) on
  body copy. The light theme's muted and accent tokens are tuned against
  `--surface` (`#F4EFE8`), not `--background` — most text sits on the surface
  tone, and checking against the lighter page ground overstates contrast by
  roughly half a point.
- **The dark ground is deliberately not near-black.** It started at `#0C0E0D`,
  which put body copy at ~15:1. Passing AA is a floor, not a target: at that
  ratio light text blooms against the background (halation), which reads as harsh
  and tires the eye over a long page. `#141714` brings body copy to ~7:1 and
  headings to ~13:1, and makes the surface steps visible instead of every layer
  reading as "black". The accent moved from brass `#D4AF61` to champagne
  `#D9BE7E` for the same reason — the saturated version vibrated against the
  dark ground. Don't darken the ground back down without re-checking both.
- **The shader runs two lighting models, not one palette.** `uLight` switches
  them. Dark is *additive* (`col += uGlow * caustic`) because you are looking at
  light in a dark room. Light is *subtractive* — every step is a `mix`, because
  adding light to an already-pale ground clips to white: measured, the additive
  model with light colours blew **49.4% of pixels to pure white**, which is why
  it looked like flat mush. Lightening its colours cannot fix that; only
  changing the model can. The noise field, the warping and the motion are
  identical between the two.
  Tuning targets, measured by rendering frames and reading pixels back:
  light-mode tonal range ~31 (hero) / ~43 (CTA), highlight clipping ~0% / ~7%
  against the dark model's ~9%. A first attempt at ~13 range was unclipped and
  visually nothing — subtlety is as much a failure here as blowout.
- **`.hero-copy` scrim is load-bearing, not decoration.** The shader is
  `inset-0` but the photograph covers the right half, so the caustics are only
  visible in the exact column the text occupies. Measured against rendered
  pixels, unscrimmed hero text hit **1.1:1** against bright caustic lanes in
  dark mode and 4.1:1 in light. With the scrim the worst single pixel in the
  text column is 10.4:1 (dark headline) and 5.2:1 (light body). Removing it
  makes the hero copy unreadable in patches. Note that a DOM-walking contrast
  check will not catch this — it reads the parent's background colour and never
  sees the canvas.
- **Floating buttons share geometry** (`--float-inset`, `--float-size`,
  `--float-gap`). They previously hardcoded their own offsets, which is how the
  scroll-top button ended up sitting on top of the WhatsApp one.
- **The stats row reveals as one block**, not per-child. Its container clips
  (`overflow: hidden`, needed for the `gap-px` hairline dividers), so translating
  children individually slides them out of frame and exposes the divider colour.

## Enhancement leads

- **GSAP SplitText** is now free in the toolset and would give real per-character
  headline animation; the current line-mask reveal is CSS-only.
- **OGL** — only 4 classes are imported. Post-processing or a second shader pass
  is available at little extra bundle cost if a third WebGL moment is ever wanted.
- **Lenis `snap`** (`lenis/snap`) could section-snap the gallery if that is ever
  desirable — it is already installed.
