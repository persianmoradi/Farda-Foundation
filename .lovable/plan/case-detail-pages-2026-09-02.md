# Case detail pages

## Goal
Make every case card open a dedicated, polished case page instead of scrolling to booking, so visitors can explore the project before taking the next step.

## Changes
- Add one dynamic case route at `/cases/$slug` for the three current projects:
  - `/cases/nordhavn-form`
  - `/cases/klar-system`
  - `/cases/spatial-01`
- Move the shared case metadata into a reusable data module so the homepage cards and detail pages stay consistent.
- Turn each full case card into a proper TanStack `Link`, preserving keyboard access, hover motion, preloading, and the existing rounded bento styling.
- Build a premium editorial case-detail layout using the current FARDA design language:
  - minimal dark navigation with a clear back-to-cases action
  - large project title and full-bleed hero image
  - project facts for year, discipline, scope, and delivery
  - concise sections for challenge, direction, solution, and outcome
  - alternating image/details layout using the existing project imagery
  - next-case navigation and a final booking CTA
- Draft concise Danish project narratives from the existing case names, categories, and descriptions; keep the content centralized so real project facts can be swapped in easily.
- Add route-specific SEO metadata for every case, plus a clean not-found state for invalid case slugs.
- Extend the existing scroll-reveal system and responsive styles to the detail pages, including reduced-motion behavior.

## Technical details
- Create `src/routes/cases.$slug.tsx` with `createFileRoute('/cases/$slug')` and validated case lookup.
- Use `<Link to="/cases/$slug" params={{ slug }}>` rather than interpolated anchors.
- Reuse the existing images and semantic color tokens; no backend or new assets are required.
- Verify all three routes, card navigation, direct URL loading, mobile/desktop layouts, motion, metadata, and absence of console errors or horizontal overflow.
