# Animated Button Fill

Buttons currently swap background colour instantly (a plain `hover:bg-*` change). Replace that with a fill that visibly sweeps across the button, so hover feels intentional and mechanical rather than like a colour flip.

## The interaction

- On hover/focus, a coloured layer wipes across the button from left to right in 420ms on the FARDA easing curve, then stays.
- On leave, the layer retracts the same way (out to the right) instead of snapping off.
- The label and icon sit above the fill and cross-fade their colour at 180ms so text stays readable through the sweep.
- Icon-only round buttons (carousel arrows, hero arrow) get the same sweep, but circular — the fill grows from the centre outward.
- Hero CTA pill: the orange body keeps the sweep, and its inner dark circle keeps only its existing arrow nudge; no vertical jump anywhere.

## Scope

Applies to every shared button variant (primary, default, outline, secondary, ghost, icon) plus the hero CTA, service card CTAs, header CTA, carousel arrows, and case-detail buttons — so all buttons behave identically across the site.

Not changed: button sizes, radii, spacing, labels, links, or any layout.

## Accessibility

- `prefers-reduced-motion: reduce` falls back to an instant colour change with no sweep.
- Keyboard `:focus-visible` triggers the same fill as hover, and the focus ring stays visible above the fill layer.
- Touch devices (`hover: none`) show the final filled state on press, without a lingering hover state.

## Technical notes

- `src/components/ui/button.tsx`: add `relative isolate overflow-hidden` to the base class, wrap children so they render above the fill layer, and drop the `hover:bg-*` colour swaps in favour of a shared `btn-fill` class per variant.
- `src/styles.css`: add a `.btn-fill::before` layer (`inset: 0`, `transform: translateX(-101%)`, `transition: transform var(--motion-fill) var(--ease-farda)`) that moves to `translateX(0)` on `:hover`/`:focus-visible`; a `.btn-fill-radial::before` variant scales from `scale(0)` for circular buttons; new `--motion-fill: 420ms` token next to the existing `--motion-hover`/`--motion-transform` tokens.
- Fill colours come from existing tokens only (`--primary`, `--accent`, `--surface-dark`, `--background`) — no new hard-coded colours.
- Verify with Playwright at 390/1024/1440: hover and focus screenshots mid-sweep and settled, reduced-motion fallback, no layout shift, no console errors.
