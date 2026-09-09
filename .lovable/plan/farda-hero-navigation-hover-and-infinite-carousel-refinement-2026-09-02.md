# FARDA hero, navigation, hover, and infinite carousel refinement

## Goal
Make the hero media truly full-bleed, align section navigation precisely, remove jumpy hover movement, and turn the cases rail into a seamless continuous loop.

## Implementation

1. **Full-bleed hero video**
   - Separate video coverage from the scroll-parallax transform so motion can never uncover an edge.
   - Keep the media layer oversized and centered across desktop, mobile, tall, and wide viewports, with the poster following the same crop.
   - Preserve continuous looping, muted autoplay, offscreen playback optimization, and reduced-motion behavior.
   - Serve the existing source at its native maximum quality. The current uploaded master is verified as 1920×1080 H.264; avoid quality-reducing CSS or re-encoding. A true resolution increase beyond Full HD would require a higher-resolution source file.

2. **Precise smooth section navigation**
   - Replace generic `scrollIntoView` positioning with a measured destination that accounts for the navigation/header offset.
   - Land each nav/CTA target cleanly at the section boundary rather than leaving part of the previous section visible.
   - Apply the same behavior to desktop navigation, mobile navigation, hero links, package CTAs, and footer links while retaining immediate navigation for reduced-motion users.

3. **Stable hover system without jumps**
   - Remove vertical translation from shared buttons and CTA hover/focus states.
   - Keep hover feedback through controlled color, border, shadow, and inner-icon motion only, so surrounding geometry remains visually fixed.
   - Remove remaining lift-style hover transforms from service cards and circular case controls where they produce the same jumpy feel.
   - Preserve keyboard focus visibility and touch-device behavior.

4. **Seamless infinite cases carousel**
   - Render mirrored case sets around the canonical slides so previous, next, autoplay, touch swipes, pointer dragging, and wheel scrolling can continue in either direction.
   - Reposition invisibly to the equivalent canonical slide after crossing a cloned boundary, avoiding the visible end-to-start rewind.
   - Keep active-case labels, progress indicators, links, keyboard controls, and autoplay synchronized to canonical case indexes.
   - Continue autoplay during hover; pause only during active drag/touch interaction and disable autoplay for reduced motion.

## Technical scope
- Update `src/routes/index.tsx` for measured anchor scrolling and infinite-carousel indexing/recentering.
- Update `src/components/ui/button.tsx` and `src/styles.css` for stable hover states, full-bleed media geometry, and loop-rail styling.
- Record completion in `roadmap.md`.

## Verification
- Test hero coverage at representative phone, tablet, desktop, tall, and ultrawide viewports with no uncovered edges.
- Confirm every anchor lands at the intended section top in normal and reduced-motion modes.
- Confirm button/card geometry does not shift on pointer hover or keyboard focus.
- Run the carousel through multiple complete cycles in both directions and verify no visible rewind, correct links/counts, continued hover autoplay, drag/swipe/wheel controls, no overflow, and no console errors.
