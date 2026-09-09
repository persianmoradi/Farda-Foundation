# Booking polish + unified hover motion

## 1. Booking section, done properly

Today the booking block is a plain white panel with a small label, a paragraph and one orange button. On larger screens the calendar only appears after clicking "Vis kalender"; on phones it just links out. It works, but it does not look like the rest of the site.

New booking presentation, same behaviour rules (button on phone, embedded calendar on larger screens):

- Rebuild the right-hand panel as a proper rounded booking card on the deep blue section: soft layered shadow, generous padding, clear internal rhythm.
- Add a short trust row above the CTA: three compact lines with orange hairline markers — "15-30 minutter", "Ingen binding", "Dansk / Engelsk" — so the card carries information instead of empty space.
- Add a small availability line ("Typisk svar inden for 24 timer") under the CTA and keep the email link as the quiet secondary path.
- Make the CTA a full-width rounded pill inside the card on narrow widths, auto-width on desktop, with the same arrow treatment as the hero CTA.
- When the calendar opens on desktop/tablet, the card keeps its rounded frame; the iframe gets a matching inner radius, a fixed height that never causes page jump, and a subtle loading placeholder so it does not flash white.
- Left column: tighten the heading/paragraph spacing so the card and heading align optically at every width.

## 2. Hover and transition consistency

The site currently mixes durations and easings per element (some 220ms, some 420ms, a few with heavy shadow/blur transitions), which is what reads as laggy or jumpy.

- Define one interaction scale and apply it everywhere: 180ms for colour/opacity, 320ms for transform and shadow, all on the existing FARDA easing curve.
- Animate only cheap properties (transform, opacity, colour, border-colour, shadow); remove transitions on blur/filter/backdrop-filter so hovers stay smooth on weaker machines.
- Standardise hover intent: cards lift only via shadow/border (no vertical jump), arrows shift a fixed 0.2rem, links reveal their underline at one shared speed.
- Add `will-change` only where a transform actually runs, and keep every hover mirrored on `:focus-visible` for keyboard users.
- Preserve the existing reduced-motion overrides and extend them to any new booking motion.

## Technical notes

- `src/styles.css`: booking card, trust rows, CTA, iframe frame/placeholder; new shared motion tokens (`--motion-hover`, `--motion-transform`) applied across nav, buttons, package cards, case slides, carousel arrows, process list, case-detail hovers.
- `src/routes/index.tsx`: booking card markup (trust rows, availability line, CTA arrow), iframe loading state.
- No content, route, palette, or Cal.com URL changes; no new dependencies.
- Verification: typecheck, plus Playwright at 320 / 390 / 768 / 1024 / 1440 with hover screenshots, overflow check, no console errors, and a reduced-motion pass.
