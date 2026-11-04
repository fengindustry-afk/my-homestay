# Redesign follow-up prompt

Handoff prompt for the next session on `redesign/homestay-v2`.

---

Continue the Indah Morib homestay redesign. A previous session finished the main pass. Your job is the leftovers below.

Repo: E:\Homestay\my-homestay (Next.js 16.2, React 19, Tailwind v4, GSAP and Lenis). Windows, with Git Bash and PowerShell.
Branch: redesign/homestay-v2, HEAD 6c18e8f. It was cut from throwaway/skill-fixes-visual, which must stay at 0494bd8. Never check that branch out or commit to it.

Read first:
- The approved plan from the first pass: C:\Users\muhdi\.claude\plans\pasted-content-id-4033-redesign-the-goofy-melody.md
- The visual target, if it still exists: C:\Users\muhdi\AppData\Local\Temp\orca-paste-1793750625997-9c77d75a-07f7-4b28-be69-6e721672d1c7.png
  - It is an editorial hotel page: cream bands, light serif headings that mix an italic line with a roman line, small tracked caps eyebrows with hairlines, full-bleed photo bands and a charcoal footer.
- Last session's screenshots, if they still exist, in C:\Users\muhdi\AppData\Local\Temp\claude\6571e122bba17c08\d3c18fa6-bffe-4a6f-a020-687d88e5e22c\scratchpad\shots-redesign\. Start with home-1440.png, home-dark-1440.png, room12-1440.png, modal-dates-1440.png, success-ok-1440.png and before\home-1440.png.
- git log --oneline throwaway/skill-fixes-visual..HEAD (11 commits).

Already done (do not redo or revert):
- app/globals.css: token values retuned. The names are unchanged because BookingModal, BookingCalendar and /finest-touch use them.
  - Light (.light, the default theme): background #F3F0EA, surface #ECE8E0, primary #1F1E1C, text-muted #6B665E, accent #2E2C29 (ink, not gold), accent-dark #141312, border #D9D3C8, ink #2A2926 (footer).
  - Dark (:root): background #181715, primary #EEEAE3, accent #EEEAE3, accent-dark #D3CDC2, ink #100F0E.
  - Radius, type scale and spacing tokens live once in :root, and .light inherits them.
  - Eyebrow dashes are CSS hairlines. Buttons are pills.
- app/layout.tsx: Playfair Display loads both normal and italic, and display headings use weight 400. The body font is Inter, on the --font-geist-sans variable.
- Homepage, with section order and ids unchanged:
  - Navbar: transparent over the hero, centred wordmark, desktop links from 1280px, hamburger below that.
  - Hero: full-bleed /images/hero-pool.jpg.
  - About: two-column intro and a stats row, then a photo band with the TCC and Muslim Friendly badges in a framed card.
  - Rooms: framed cards.
  - Amenities: circle icons.
  - Gallery: edge-to-edge strip.
  - Testimonials: three cards, middle one highlighted.
  - CTA: photo banner.
  - Footer: charcoal.
- Other pages and cleanup:
  - /homestay/[id] (RoomDetail.tsx): photo hero, price and description band, facts row, amenity cards.
  - BookingModal and BookingCalendar: styling changes only.
  - /success: framed card. Its logic and its wa.me message are unchanged.
  - ShaderBackground.tsx and dead CSS were removed.
- Copy edits already made (keep them):
  - "01 /" numbering dropped from eyebrows.
  - "Indahmorib" became "Indah Morib".
  - "use a home together" (was "use a space together").
  - "Free private parking for every guest" (dropped the word "space").
  - "A look inside" (was "The space").
- Left out of the image on purpose (do not add them): a press logo row (replaced by real stats and badges), a newsletter field, a footer quote, a "Watch tour film" link, carousel arrows.
- Verified at HEAD:
  - npm test 22/22, and npm run build passes.
  - seo-check matches its baseline.
  - Booking math: Homestay 6, Unit Right, 2 nights = RM300 (never submitted).
  - No horizontal scroll at 390px, scroll reveals finish, focus rings visible.

Your tasks, in order:
1. Dark-mode testimonial highlight. The middle card in components/TestimonialsSection.tsx uses --ink. In dark mode --ink (#100F0E) is almost the page background (#181715), so the highlight disappears. Make the middle card stand out in both themes. Light mode must look the same as now.
2. Keyboard access for the booking calendar. The day cells in components/BookingCalendar.tsx are clickable divs, so keyboard users cannot pick dates.
   - Turn them into `<button type="button">`.
   - Give each an aria-label with the full date and its state (available, discounted, booked, selected).
   - Disable them when booked or past, and give them a visible focus ring.
   - Do not change the date, availability, discount or price logic.
3. Measure text contrast over photos.
   - Take 1440 and 390 screenshots.
   - Sample the pixels behind the hero paragraph, the CTA banner paragraph and the "Recognitions & Standards" band.
   - Tune the scrims until white body text is at least 4.5:1 and the large serif headings are at least 3:1.
   - Report the measured ratios.
4. Remove the unused ogl dependency. Confirm nothing imports it, run npm uninstall ogl, and commit package.json and package-lock.json together.
5. Check the room photo grid. No room (ids 3, 4, 5, 6, 12, 13) has rows in room_photos yet, so the "A look inside" grid in RoomDetail.tsx has never rendered.
   - Verify it with a temporary edit in RoomDetail.tsx (not page.tsx) that falls back to 3 existing photo URLs from the Supabase room-photos/Content folder.
   - Take 1440 and 390 screenshots, then revert.
   - Never write to the database, and never commit the temporary edit.

Constraints:
- Keep every fact in lib/site.ts. Do not change prices, rules, addresses or phone numbers.
- Do not touch lib/seo.ts, app/page.tsx, app/homestay/[id]/page.tsx, components/JsonLd.tsx or scripts/.
- Keep the SEO work: JSON-LD, room titles, WhatsApp links tagged "(dari website)", the server-rendered room grid, one h1 per page.
- Keep the visual fixes:
  - Book Now stays inside `<div className="hidden md:block">`.
  - .btn-primary:hover uses var(--accent-dark).
  - .room-card-book keeps min-height 44px below 768px.
- Keep the booking flow working. Never click "Proceed Payment" and never submit the form. The wa.me message on /success stays byte-identical.
- No em dashes in any copy, and none of the words in the E:\Homestay\CLAUDE.md blacklist.
- Respect prefers-reduced-motion and keep visible focus states.

Known traps from the first pass:
- globals.css rules are unlayered, so they beat Tailwind utilities. Never put hidden or md: display utilities on an element whose custom class sets display. Wrap the element instead.
- Stop any next start you started before running npm run build. An old server re-renders "/" through ISR (revalidate 300) and overwrites the fresh HTML in .next.
- Start the prod server with node node_modules/next/dist/bin/next start -p 3100, not npx, so stopping it kills the real process.
- Nothing is running on port 3000 now. Start your own dev server if you want hot reload.
- Stopping processes you did not start was blocked by the permission check. Only stop servers this session started.
- scripts/seo-check.mjs defaults to production, so always pass http://localhost:3100. Its baseline is 46 pass and 5 FAIL: kolam, plus 4 landing checks because /family-day and /dewan-majlis-banting do not exist. Those 5 are expected.
- Screenshots use playwright-cli (global @playwright/cli, run with open --browser chrome):
  - Run set-reduced-motion reduce before goto, because the GSAP reveals start at opacity 0.
  - Scroll the page in steps with eval so lazy images load, then run screenshot --full-page.
  - Block analytics first, so test runs do not add page views to Google Analytics. Route each of these to --status 204: "https://www.googletagmanager.com/**", "https://*.google-analytics.com/**" and "https://*.analytics.google.com/**".
- Run playwright-cli close-all before npm run build. With browsers still open, the build failed with os error 1450 (insufficient system resources).
- playwright-cli writes a .playwright-cli/ folder in the working directory. Delete it before committing.
- Add files by explicit path. Never use git add -A, because .serena/ must stay untracked.

Verification (must pass before reporting done):
- npm test passes.
- npm run build passes.
- node scripts/seo-check.mjs http://localhost:3100 shows no FAIL on canonical, jsonld, room-h1 or wa-tag, and no FAIL outside the known baseline of 5.
- git diff throwaway/skill-fixes-visual -- lib/site.ts lib/seo.ts shows nothing.
- git diff throwaway/skill-fixes-visual -- components/BookingCalendar.tsx shows no change to prices, discounts or date logic.
- Keyboard test: Tab into the open booking calendar, pick two dates with Enter, and confirm Nights updates. Stop before payment.
- Screenshots at 1440 and 390 of /, dark-mode /, /homestay/12 and the booking modal with dates picked, saved in a shots-followup folder in your scratchpad.

Do not push, merge or open a PR. Commit on redesign/homestay-v2 in small steps.
Report: what changed per task, the measured contrast ratios, the test output, the screenshot paths, and anything you could not do.

The reference image and last session's screenshots sit in Windows Temp, so they may get cleaned up before you start. If they matter, copy them somewhere permanent first.
