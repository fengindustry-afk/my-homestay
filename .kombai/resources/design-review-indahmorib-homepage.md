# Design Review Results: Indah Morib Homestay — Home Page (`/`)

**Review Date**: 2026-02-26
**Route**: `/` (Landing Page)
**Focus Areas**: Visual Design · UX/Usability · Micro-interactions/Motion

---

## Summary

The Indah Morib Homestay landing page has a polished overall visual identity with a warm gold/amber accent palette, Playfair Display headings, and thoughtful hover micro-interactions. However, several functional bugs (missing assets, hydration errors, incorrect SVG icons), UX friction points (popup showing every load, no gallery lightbox, poor filter reset UX), and a few motion concerns (scroll animations fire on load rather than on scroll) collectively hurt the user experience. The issues below are prioritised to help you focus on the highest-impact fixes first.

---

## Issues

| # | Issue | Criticality | Category | Location |
|---|-------|-------------|----------|----------|
| 1 | **`/Ramadhan-Discount.png` missing from `public/`** — BannerPopup's `<Image>` throws `ERR_CONNECTION_REFUSED` and shows a blank modal that still blocks the page | 🔴 Critical | Visual Design | `components/BannerPopup.tsx:27-33` |
| 2 | **`globals.css` unlayered CSS overrides Tailwind v4 utilities** — All custom class rules (`.nav-glass`, `.hero-section`, `.btn-primary`, `*` reset, etc.) are unlayered; in Tailwind v4 unlayered styles beat all utility classes, so `m-4`, `p-2`, and other utilities cannot override these custom classes | 🔴 Critical | Visual Design | `app/globals.css:64-1079` |
| 3 | **Hydration mismatch** — `SearchBar`'s `<input type="date">` uses `defaultValue={new Date().toISOString()...}` which differs between SSR and client, producing a React console error | 🔴 Critical | UX/Usability | `components/SearchBar.tsx:28` |
| 4 | **Swimming Pool amenity has wrong SVG icon** — The SVG path `M8.5 14.5A2.5 2.5 0 0011 12...` renders a flame/candle shape, not a swimming pool | 🔴 Critical | Visual Design | `components/AmenitiesSection.tsx:4-9` |
| 5 | **BannerPopup shows on every page load** — `useEffect` unconditionally calls `setIsOpen(true)`; there is no `sessionStorage` or `localStorage` check to remember dismissal | 🟠 High | UX/Usability | `components/BannerPopup.tsx:10-13` |
| 6 | **Dark mode activates from system preference, overriding `defaultTheme="light"`** — `ThemeProvider` is missing `enableSystem={false}`, so on systems set to dark mode the whole page renders in dark mode regardless of developer intent | 🟠 High | Visual Design | `app/layout.tsx:53-57` |
| 7 | **Footer social links use text abbreviations (`Fb`, `Ig`, `X`, `Yt`) instead of proper icons** — The circular `.footer-social a` button style was designed for icons, but contains plain text, looking unprofessional | 🟠 High | Visual Design | `components/Footer.tsx:29-32` |
| 8 | **Gallery has no lightbox on image click** — Clicking any gallery image performs no action; users expect to view full-size images | 🟠 High | UX/Usability | `components/GallerySection.tsx:47-55` |
| 9 | **CTA contact email is truncated** — The Email card displays `"indahmoribhomestay"` (without `@gmail.com`), giving an incomplete and confusing contact detail | 🟠 High | UX/Usability | `components/CTASection.tsx:59` |
| 10 | **"Reset Filters" calls `window.location.reload()`** — This triggers a full page reload, wiping Supabase fetched data and re-running all animations, instead of simply clearing the filter state | 🟠 High | UX/Usability | `components/RoomsSection.tsx:155` |
| 11 | **`middleware.ts` is deprecated in Next.js 16** — The dev server shows `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead`; this is a framework-level warning affecting future compatibility | 🟠 High | UX/Usability | `middleware.ts` (root) |
| 12 | **Scroll-triggered animations fire immediately on page load** — `.animate-fade-up`, `.animate-slide-left`, `.animate-scale-in` etc. run via CSS `animation` without any `IntersectionObserver`; elements below the fold animate before the user sees them | 🟡 Medium | Micro-interactions | `app/globals.css:179-225` / all section components |
| 13 | **BannerPopup has no entry/exit animation** — The modal appears and disappears abruptly with no transition, which feels jarring | 🟡 Medium | Micro-interactions | `components/BannerPopup.tsx:17-37` |
| 14 | **`TestimonialsSection` is missing a section `id` attribute** — Other sections use `id="about"`, `id="rooms"` etc. for anchor navigation; testimonials has no `id`, preventing future deep-linking | 🟡 Medium | UX/Usability | `components/TestimonialsSection.tsx:26-29` |
| 15 | **No active navigation link indicator while scrolling** — Nav links have no active/current-section state using `IntersectionObserver`, so the user has no visual feedback about which section they are reading | 🟡 Medium | UX/Usability | `components/Navbar.tsx:63-69` |
| 16 | **Testimonial cards show untruncated long reviews** — First review is ~300 words; all three reviews run to full height making the section vertically bloated and visually unbalanced | 🟡 Medium | Visual Design | `components/TestimonialsSection.tsx:1-23` |
| 17 | **`"Discover More"` button (`btn-dark`) is invisible in dark mode** — `btn-dark` uses `var(--primary)` as background which is `#cfd6df` (near-white) in dark mode, producing a near-invisible button against a dark background | 🟡 Medium | Visual Design | `components/AboutSection.tsx:188` / `app/globals.css:400-422` |
| 18 | **Hero image crop shows roof/trellis and sky at top** — `backgroundPosition: "center"` keeps the pool centered but the upper third of the image shows a distracting rooftop/trellis structure; `"center 60%"` would better showcase the pool | 🟡 Medium | Visual Design | `components/HeroSection.tsx:9-14` |
| 19 | **`onSearch` prop typed as `any`** — `SearchBarProps` uses `(criteria: any)` instead of `{ roomType: string; guests: string }`, bypassing TypeScript's type safety | 🟡 Medium | UX/Usability | `components/SearchBar.tsx:5` |
| 20 | **CTA section background image sourced from Google Maps** — URL `lh3.googleusercontent.com/p/AF1QipP...` can expire or be rate-limited; use a Supabase-stored image for reliability | ⚪ Low | Visual Design | `components/CTASection.tsx:8-10` |
| 21 | **Logo is a single letter "I"** — The text logo (`I` in a gold square + `Indahmorib`) is functional but lacks the distinctiveness of an actual brand mark | ⚪ Low | Visual Design | `components/Navbar.tsx:33-59`, `components/Footer.tsx:8-22` |
| 22 | **Gallery section has no "View All" CTA** — With 5 images visible, there is no indication of more photos or a link to a gallery page, leaving interested users with no next step | ⚪ Low | UX/Usability | `components/GallerySection.tsx:46-58` |
| 23 | **Admin panel link is publicly visible in footer** — `"at its finest"` in the footer brand description links to `/finest-touch` (the admin dashboard) via an unstyled `<a>` tag — a subtle but unnecessary security exposure | ⚪ Low | UX/Usability | `components/Footer.tsx:26` |
| 24 | **`metadataBase` not set** — Next.js warns that OpenGraph/Twitter image URLs may be incorrect without `metadataBase` in metadata config | ⚪ Low | UX/Usability | `app/layout.tsx:19-40` |

---

## Criticality Legend
- 🔴 **Critical**: Breaks functionality, visible console errors, or fails to render correctly
- 🟠 **High**: Significantly impacts user experience or design quality
- 🟡 **Medium**: Noticeable issue that should be addressed for polish
- ⚪ **Low**: Nice-to-have improvement or minor concern

---

## Next Steps (Suggested Priority Order)

### 🔴 Immediate (Critical)
1. **Add `/public/Ramadhan-Discount.png`** or remove/replace the BannerPopup image — stops the console error and broken popup
2. **Wrap all custom CSS in `@layer base` / `@layer components`** in `globals.css` per Tailwind v4 requirements
3. **Fix Swimming Pool SVG** — replace the candle path with Waves or Droplets icon from `lucide-react`
4. **Fix hydration mismatch** — use `useState` + `useEffect` for the date default value in `SearchBar`

### 🟠 High Priority  
5. **BannerPopup: add sessionStorage check** — only show once per browser session
6. **Add `enableSystem={false}`** to `ThemeProvider` to always honor `defaultTheme="light"` 
7. **Footer social icons** — import `Facebook`, `Instagram`, `Twitter`, `Youtube` from `lucide-react`
8. **Gallery lightbox** — add a simple modal/lightbox when gallery images are clicked
9. **Fix truncated email** in CTASection — show full `indahmoribhomestay@gmail.com`
10. **"Reset Filters"** — call state setter `setFilterCriteria(undefined)` via prop instead of page reload
11. **Rename `middleware.ts` → `proxy.ts`** per Next.js 16 spec

### 🟡 Medium Priority
12. **Add IntersectionObserver** for scroll-triggered animations (add `opacity: 0` initially, apply animation class on scroll entry)
13. **Add fade-in/fade-out** to BannerPopup open/close
14. **Truncate long testimonials** with a "Read More" expand button
15. **Add active nav link tracking** using `IntersectionObserver` for section highlighting
16. **Fix `btn-dark`** for dark mode — use a border-based approach or ensure sufficient contrast
17. **Improve hero image crop** — change `backgroundPosition` to `"center 60%"`
18. **Add `id="testimonials"`** to TestimonialsSection

### ⚪ Low Priority  
19. **Set `metadataBase`** in `app/layout.tsx`
20. **Gallery "View All" CTA** — add a button or link below the gallery grid
21. **Remove or protect the `/finest-touch` link** in footer
22. **Fix `any` type** in `SearchBar.tsx:5`
23. **Replace CTA background image** with a Supabase-stored URL for reliability
