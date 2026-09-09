# Cases carousel: scroll, focus-click and timer cleanup

Three fixes to the homepage Cases carousel. No layout or card-position changes.

## 1. Page scrolls normally when hovering a case

Right now the rail intercepts vertical mouse-wheel input and turns it into horizontal
movement, so the page stops scrolling while the cursor is over the cases. Remove that
wheel interception entirely: vertical wheel scrolls the page as everywhere else.
Horizontal movement stays available through trackpad horizontal swipes, drag, touch
swipe, and the arrow buttons. Cards keep their current positions and transforms.

## 2. Only the centered case is clickable

- The centered (active) case keeps its link to its case page.
- The cards on the left and right are no longer links. Clicking the left card brings
  it into focus (steps back one), clicking the right card brings it into focus (steps
  forward one). Cards further out are not interactive.
- Keyboard: only the centered card is tab-reachable, as it is today.

## 3. Remove the progress timer line

- Remove the animated line that fills while a case is previewed, plus its segment
  buttons.
- Navigation is left/right arrow buttons only. The `01 / 03` counter stays.
- Autoplay keeps advancing as it does now (still not paused by hover).

## Technical notes

- `src/routes/index.tsx`: drop the `wheel` listener effect; render the active slide
  as a `Link` and non-active slides as buttons that call the existing
  `scrollToRailIndex` for their own index; remove the progress-indicator markup and
  the `--case-interval` custom property write.
- `src/styles.css`: remove `.case-carousel-progress` rules, the `case-progress`
  keyframes if unused elsewhere, and adjust `.case-carousel-controls` grid (desktop
  and mobile breakpoint) so arrows and counter still align.
- Reduced-motion behaviour and case detail routes unchanged.
