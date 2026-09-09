# FARDA interaction and rounded UI refinement

## Goal
Make navigation, hover feedback, section transitions, cards, buttons, and the case carousel feel like one precise premium system, using the selected **Kinetic architectural glass** direction while preserving FARDA’s palette, Helvetica hierarchy, content, background video, routes, and case pages.

## Changes

### 1. Smooth in-page navigation
- Replace the current abrupt anchor jumps with a shared, offset-aware smooth-scroll behavior for header links, hero actions, service CTAs, and scroll cues.
- Use controlled cinematic easing and account for the header so section headings land cleanly in view.
- Preserve URL hashes, keyboard navigation, browser history, and immediate scrolling for `prefers-reduced-motion` users.

### 2. Unified transition and hover language
- Consolidate hover/focus timing around one restrained easing curve and a small set of durations.
- Remove bulky lifts, excessive scaling, and mismatched transitions.
- Use subtle image scale, 1–3px movement, clean color fills, and equivalent `focus-visible` feedback.
- Keep motion transform/opacity based and disable nonessential motion for reduced-motion users.

### 3. Rounded cards and buttons
- Give service cards independent spacing, premium rounded corners, restrained borders, and soft architectural depth instead of the current square joined grid.
- Standardize primary, outline, icon, header, service, and booking buttons as rounded pills/circles with consistent height, padding, arrow movement, hover fill, and press feedback.
- Keep orange as the decisive action accent and Imperial Blue as the featured service surface.

### 4. Rebuild the hero CTA
- Replace the small outlined circular CTA with the selected direction’s confident rounded pill.
- Keep “Start et projekt,” add a clean directional arrow reveal, improve contrast over the video, and make its hover/focus/press states feel precise rather than decorative.
- Rebalance the supporting copy and CTA spacing on desktop and mobile without changing the hero composition.

### 5. Horizontally scrollable cases carousel
- Convert the cases stage into a true horizontal scroll-snap rail that supports mouse wheel/trackpad horizontal scrolling, touch swiping, and pointer dragging.
- Keep partial adjacent cards visible to communicate direction, with rounded case cards and restrained image/content hover treatment.
- Keep auto-advance running while the pointer merely hovers over the carousel; only avoid fighting the user during an active drag/swipe, then resume automatically.
- Synchronize active case, counter, progress, arrow controls, keyboard navigation, and scroll position.
- Preserve links to all existing case-detail routes and reduced-motion behavior.

## Technical details
- Update the homepage interaction state and carousel mechanics in `src/routes/index.tsx`.
- Refine shared button variants in `src/components/ui/button.tsx` and the FARDA tokens/component styles in `src/styles.css`.
- Keep existing images, copy, Cal.com embed, metadata, and route structure unchanged.

## Verification
- Test anchor scrolling, every CTA, carousel arrows, keyboard controls, hover behavior, drag/swipe, trackpad scrolling, and case routing.
- Verify desktop and mobile layouts, no clipping or horizontal page overflow, no console errors, stable carousel dimensions, and usable reduced-motion behavior.
