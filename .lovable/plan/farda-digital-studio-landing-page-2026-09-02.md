# FARDA Digital Studio Landing Page

## Goal
Build a premium Danish B2B studio landing page at `/` with quiet architectural confidence, strict Helvetica hierarchy, restrained motion, and a complete booking journey.

## Experience
- Minimal sticky header with FARDA wordmark, section navigation, and orange “Book samtale” CTA.
- Full-bleed dark hero with oversized 3D-style FARDA / BUILD TOMORROW typography, layered architectural imagery, subtle UI planes, and a floating orange scroll cue.
- Light service overview flowing into two high-contrast pricing cards for Essential and Advanced, including all supplied features and pricing.
- Portfolio showcase with a polished horizontal project slider and purpose-made abstract/UI visuals rather than generic stock photography.
- About/process section using bold editorial typography and concise Danish copy.
- Dark-to-light booking section with the supplied heading, supporting text, and an embedded `https://cal.com/farda` scheduler.
- Minimal dark footer with oversized BUILD TOMORROW typography, email, CVR placeholder, and Privacy / Terms links.

## Visual System
- Palette: Alice Blue `#EAF6FF`, Shadow Grey `#232528`, Imperial Blue `#2A2A72`, Accent Orange `#FFA400`, Bright Blue `#009FFD`.
- Helvetica/Arial sans-serif stack; bold headlines, medium subheads, regular body.
- Sharp architectural composition, restrained radii, fine rules, deep typographic scale, and no agency clichés.
- Scroll reveals, gentle image/plane motion, active navigation details, and reduced-motion support.

## Technical Details
- Rebuild `src/routes/index.tsx` as the complete semantic landing page with route-specific metadata.
- Extend `src/styles.css` with the FARDA semantic token system, reusable presentation utilities, and motion definitions.
- Update root document metadata/font behavior only where needed for the supplied Helvetica system.
- Generate and import cohesive architectural/UI artwork into `src/assets/`.
- Use CSS scroll snapping and React state for the portfolio slider; use native anchors for navigation.
- Keep the Cal.com integration isolated in a responsive iframe with an external fallback link.
- Validate the live page at desktop and mobile sizes, including overflow, hierarchy, navigation, slider controls, and the booking embed.
