# Redesign FARDA’s case section

## Goal
Replace the current sharp-edged horizontal carousel with the selected **Cinematic Editorial Bento** direction: a premium dark gallery with one dominant featured project and two supporting cases.

## Design changes
- Keep FARDA’s dark gallery palette: Shadow Grey `#232528`, soft charcoal `#34373B`, Alice Blue `#EAF6FF`, and orange `#FFA400` for focused micro-details.
- Preserve the existing disciplined FARDA typography while applying the chosen Sora/Manrope-style hierarchy within this section through the project’s semantic font tokens and available fallbacks.
- Retain the current Danish headline, section numbering, case names, imagery, categories, and years.
- Use a responsive 12-column editorial composition on desktop:
  - **Nordhavn Form** as the large featured card.
  - **Klar System** and **Spatial / 01** stacked as compact supporting cards.
- Add rounded card edges, subtle borders, controlled image overlays, compact metadata, and a clear circular arrow action without nesting cards.
- Remove carousel arrows, horizontal scrolling, active-slide state, and the progress bar because all three cases will be visible in the new composition.

## Motion and interaction
- Reveal the featured card first, then stagger the supporting cards on scroll.
- Use slow image scaling, slight card lift, overlay softening, and arrow movement on hover.
- Keep transitions restrained and consistent with the existing cinematic easing.
- Preserve keyboard focus visibility and reduced-motion behavior.

## Responsive behavior
- Collapse to a single-column case feed on mobile while keeping the featured project visually dominant.
- Keep stable image aspect ratios, readable overlay text, comfortable touch targets, and no horizontal overflow.

## Validation
- Verify the section at desktop and mobile viewport sizes.
- Confirm all three cases render, hover/focus states work, scroll reveals activate, and no console errors or overflow regressions appear.
