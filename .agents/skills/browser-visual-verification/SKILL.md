---
name: browser-visual-verification
description: Verify visual changes in a real browser with repeatable desktop, mobile, interaction, motion, and screenshot checks.
---

# Browser Visual Verification

Adapted from Ruflo's MIT-licensed browser testing skill for Playwright-based local verification. It does not require Ruflo's browser MCP or RVF runtime.

## When to use

Use for UI changes, responsive defects, interaction bugs, animation work, and visual regressions.

## Workflow

1. Open the local preview in a fresh Playwright browser context.
2. Use a desktop viewport of 1280 × 1800 unless the task names another target.
3. Wait for the affected UI, then inspect:
   - Final URL and document title.
   - Console errors and uncaught page errors.
   - Horizontal overflow and clipped content.
   - Visible focus states and keyboard-operable actions.
4. Exercise the complete affected flow with stable role or label selectors.
5. Capture viewport or element screenshots at each state needed to prove the result.
6. Repeat at a representative mobile width.
7. For motion work, also test `prefers-reduced-motion: reduce` and confirm that essential content is immediately available.
8. Inspect every screenshot before concluding; screenshots are evidence, not decoration.

## Motion checks

- Prefer transform and opacity animation.
- Confirm autoplay motion pauses when offscreen or during direct user interaction where appropriate.
- Confirm layout does not shift when controls, labels, or dynamic text change.
- Confirm hover polish has an equivalent focus-visible state.

## Reporting

Summarize the exact routes, interactions, widths, and error state verified. Never claim success from compilation alone.