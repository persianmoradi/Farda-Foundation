# Cases: buttons-only navigation, visible on phone/tablet, nicer booking card

## What you'll get

- Cases change **only** via the left/right buttons (and arrow keys) — no dragging, no trackpad/wheel sideways scrolling, no swipe.
- The cases section reliably appears on phone and tablet.
- Phone/tablet cases layout tightened: bigger focused card, calmer neighbours, larger tap targets, no sideways page movement.
- Booking on phone/tablet keeps the "Åbn kalender" button that opens Cal.com, but the card is redesigned to look intentional instead of half-finished.
- Desktop flag-fan (hover to centre, click to expand) stays exactly as it is.

## Why cases can look empty

Scroll-reveal adds `opacity: 0` to every `.reveal` element and only restores it for elements that existed when the observer was created. The cases block is swapped between the fan and the carousel by a viewport check that runs after mount, so a reveal element introduced by that swap is never observed and can stay fully transparent — an empty-looking section. This is the most likely cause of what you see; the fix removes the failure mode entirely rather than guessing at your device.

## Technical changes

**`src/hooks/use-scroll-reveal.ts`**
- Observe reveal elements added later (MutationObserver on the document body, or re-scan on layout-mode change) so newly mounted `.reveal` nodes always get `is-visible`.
- Safety net: if an element is already in or above the viewport at registration time, mark it visible immediately, and reveal anything still hidden after a short timeout. Content can never be permanently invisible.

**`src/routes/index.tsx`** (carousel navigation)
- Delete pointer-drag state and handlers (`handlePointerDown/Move`, `finishDrag`, `dragOffset`, `DRAG_THRESHOLD`) and the horizontal wheel listener.
- Keep: arrow buttons, `ArrowLeft`/`ArrowRight` keys, the `01 / 03` counter, autoplay that always lands on a case (never between cases), reduced-motion disabling autoplay.
- Centre card stays the link to its case page; side cards remain focus buttons; vertical page scrolling untouched.

**`src/routes/index.tsx` + `src/styles.css`** (phone/tablet presentation)
- Larger active card and lower-contrast, further-recessed neighbours at ≤767px and 768–1179px so the focus is unmistakable.
- Arrow buttons at least 44×44px with visible focus rings, positioned under the card.
- Confirm zero horizontal overflow at 320, 390, 768 and 820px.

**Booking card (`src/styles.css`, booking markup)**
- Keep the external-link behaviour; restyle the card: consistent rounded radius, clearer label/heading/body rhythm, full-width pill CTA on narrow screens, proper padding and contrast against the blue section, no inner scroll area.

## Verification

Playwright at 320 / 390 / 768 / 820 / 1440: cases visible and opaque, arrows advance and wrap, no drag or sideways wheel movement, page scrolls vertically over the cards, booking card renders correctly and its link points at Cal.com, zero horizontal overflow, no console errors. Screenshots reviewed at each width, plus a reduced-motion pass.
