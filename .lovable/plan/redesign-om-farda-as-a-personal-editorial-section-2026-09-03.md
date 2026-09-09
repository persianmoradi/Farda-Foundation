# Redesign "Om FARDA" as a personal editorial section

## Goal
Replace the current minimal two-column "Om FARDA" section with a polished, personal "behind the brand" layout inspired by the Dribbble reference — a large rounded portrait on the left and editorial story content on the right.

## Content
- Eyebrow/kicker: "BAG FARDA" (small uppercase label).
- Headline: "We don't just build for today. We build for tomorrow." — the word "tomorrow" rendered in the accent orange color.
- Body: the supplied story about the Persian word *Farda* meaning "i morgen", building digital foundations for the future, and designing with tomorrow in mind.
- CTA: "Book en samtale" button linking to `#booking`.
- Signature line below CTA: "FARDA" / "Founder & Digital Director" (placeholder until the user supplies a name).

## Visual
- Left column: a large rounded portrait placeholder image generated in FARDA's architectural/minimal palette (Alice Blue, Shadow Grey, Accent Orange). The placeholder clearly signals where the user's own photo will be dropped in later.
- Right column: stacked editorial text, generous whitespace, and the CTA + signature.
- No floating stat badges and no bottom stat row, per the user's request.
- Keep the existing light section background (`section-light`) and rounded card radius system (`--radius-editorial`).

## Responsive behavior
- Desktop: two-column grid (image ~45%, text ~55%) with the image pinned to the left.
- Tablet: narrower two-column layout or slightly reduced image width.
- Mobile: single column, image stacks above text, full-width rounded image.
- Preserve scroll-reveal entrance and reduced-motion fallback.

## Motion
- Section elements use the existing `.reveal` / `.reveal-late` system.
- Subtle scale on the portrait image on hover/focus (`--scale-subtle`, `--motion-slow`).
- CTA uses the existing animated button-fill treatment.

## Files to change
- `src/routes/index.tsx` — replace the `#about` section markup.
- `src/styles.css` — add `.about-editorial`, `.about-portrait`, `.about-signature`, and responsive rules.
- `src/assets/` — generate and import a placeholder portrait image (`about-portrait.jpg`).

## Verification
- Typecheck passes.
- Playwright screenshots at 390px, 768px, 1024px, and 1440px confirm no overflow, readable text, proper stacking, and no console errors.
