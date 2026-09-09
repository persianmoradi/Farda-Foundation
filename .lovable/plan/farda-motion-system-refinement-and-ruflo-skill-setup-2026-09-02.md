# FARDA motion-system refinement and Ruflo skill setup

## Goal
Refine the existing FARDA site around the selected **Kinetic editorial system**: quieter, sharper, and more futuristic, with one consistent interaction language across the homepage and case pages. Preserve the current Danish content, FARDA palette, hero background video, booking flow, carousel behavior, and case routes.

## Visual direction
- Keep FARDA’s palette: Alice Blue `#EAF6FF`, Shadow Grey `#232528`, Orange `#FFA400`, and Bright Blue `#009FFD`.
- Preserve the strict Helvetica-like hierarchy while tightening scale, spacing, and weight relationships.
- Use an editorial magazine rhythm: asymmetric section compositions, strong typographic anchors, restrained card framing, and cleaner dark/light handoffs.
- Match the selected direction’s energy without copying its placeholder content: precise, cinematic, technical, and deliberately minimal.

## Implementation
1. **Create one motion system**
   - Define shared duration, easing, reveal-distance, hover-lift, scale, and radius tokens.
   - Consolidate the duplicated scroll-reveal logic into one reusable hook for the homepage and case-detail routes.
   - Standardize entrance choreography: section label, headline, copy, then content with subtle stagger.
   - Keep transforms and opacity as the primary animated properties for smooth rendering.

2. **Polish navigation and hero**
   - Preserve the looping 3D background video and cinematic centered hero composition.
   - Refine header transition states, link feedback, CTA hover/focus behavior, hero entrance timing, parallax strength, and scroll cue.
   - Remove excessive scaling and make motion responsive rather than slow or ornamental.

3. **Refine services, cases, about, booking, and footer**
   - Recompose Services toward the selected kinetic editorial treatment while retaining both existing FARDA packages and pricing details.
   - Simplify oversized radii and heavy card treatments into a controlled editorial surface system.
   - Keep the Cases carousel and dedicated case links, but reduce filter-heavy 3D movement, synchronize progress timing, pause autoplay offscreen, and add predictable hover/focus states.
   - Give About/process rows, booking handoff, and footer links the same line, arrow, color, and reveal behavior.
   - Apply the same system to case-detail pages for consistent route-to-route motion.

4. **Clean up the current CSS and interaction code**
   - Remove the confirmed unused legacy bento case styles.
   - Merge duplicated selectors and replace scattered duration/transform values with shared tokens.
   - Avoid blur-heavy and continuously running effects where they do not add meaning.
   - Preserve keyboard navigation, visible focus states, touch behavior, and `prefers-reduced-motion` fallbacks.

5. **Handle Ruflo skills safely**
   - Do not install all 300+ Ruflo skills blindly: many depend on Ruflo’s own CLI and MCP tools and would fail in this workspace unchanged.
   - Inspect the repository manifest, identify the skills that are genuinely useful for this project, and import only self-contained or adaptable definitions as drafts.
   - Remove or translate unsupported Ruflo/MCP command assumptions before presenting drafts for activation.
   - Keep the website implementation independent of Ruflo runtime dependencies.

6. **Verify the experience**
   - Check desktop and mobile layouts for overflow, clipped text, competing transitions, and inconsistent radii.
   - Exercise navigation, hover/focus states, carousel controls/autoplay, case routing, booking visibility, and reduced-motion mode.
   - Confirm the hero video keeps playing, the carousel pauses when offscreen, animations do not replay distractingly, and no console or page errors appear.

## Technical notes
- The current code has duplicated reveal observers, a carousel interval duplicated between JavaScript and CSS, unused legacy case-grid CSS, and many unrelated transition durations and hover transform values. These will be unified rather than layered over.
- The selected prototype is a structural and motion reference; existing FARDA copy, assets, routes, and functionality remain authoritative.
- Ruflo is an orchestration framework, not a drop-in Lovable skill pack. Compatible skills will be curated as drafts rather than activating framework-dependent shell/MCP behavior automatically.
