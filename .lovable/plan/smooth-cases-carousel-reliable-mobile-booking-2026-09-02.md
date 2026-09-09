# Smooth cases carousel + reliable mobile booking

Two problems, both fixed by replacing fragile mechanics with simpler, fully controlled ones.

## 1. Cases carousel — make motion genuinely smooth

Today the carousel rides on native horizontal scrolling with scroll-snap, plus manual `scrollLeft` dragging, a scroll listener that recomputes the active card every frame, and timed "recentering" jumps for the loop. Those systems fight each other, which is what makes it feel sticky, occasionally snap oddly, and jump when it wraps.

Rebuild it as a transform-driven coverflow:

- One track moved by a single CSS transform toward the active index; the browser animates the whole move with our cinematic easing, so every transition is one continuous glide instead of scroll corrections.
- Cards keep their exact current look and geometry: active card in front and centered, previous/next recessed left and right, further cards faded back.
- Infinite loop by index arithmetic (index wraps modulo the case list), so left and right go on forever with no reset, no boundary, no visible jump.
- Dragging: pointer/touch drag offsets the track live and, on release, settles to the nearest case with one smooth glide. Trackpad horizontal swipe also advances.
- Vertical page scrolling over the section stays completely untouched.
- Behaviour we keep: only the centered card links to its case page, side cards bring themselves into focus when clicked, arrows and the `01 / 03` counter, auto-advance that does not pause on hover, arrow-key support, reduced-motion (instant changes, no autoplay).

## 2. Booking section — proper phone experience, no self-scrolling

Today a fixed-height Cal.com iframe is embedded directly. On phones it is cropped, has its own inner scrollbar, and the embed can move the page on its own while loading.

- The calendar is no longer auto-embedded on load. The section shows a rounded booking card (heading, short copy, email) with a clear primary action.
- On phones: tapping the action opens Cal.com — either full-screen inside the page or in a new tab — so there is never a small scrolling box inside a scrolling page.
- On tablet/desktop: the calendar loads inline on request inside the rounded shell, sized to the viewport so the whole month view fits without an inner scrollbar.
- The embed is only mounted after interaction, which removes the unwanted automatic page movement entirely.
- Name and email stay empty for every visitor, and the "open calendar in a new window" fallback stays.

## Technical notes

- `src/routes/index.tsx`: replace the scroll/scroll-snap carousel logic (drag handlers, `normalizeLoop`, `syncActiveCase`, programmatic-scroll refs, rail-index centering effects) with an index-based transform carousel plus a drag-offset state; rework the booking block to a deferred-embed card with a mobile branch.
- `src/styles.css`: convert `.case-carousel-stage` / `.case-slide` from scroll container to transform track while preserving current sizes, radii, scale and opacity steps; add responsive booking card and viewport-based calendar height rules.
- Verify with Playwright at 320 / 390 / 768 / 1440: continuous looping in both directions, drag settle, vertical scroll unaffected, booking card readable with no nested scroll and no automatic page movement, zero horizontal overflow, no console errors.
