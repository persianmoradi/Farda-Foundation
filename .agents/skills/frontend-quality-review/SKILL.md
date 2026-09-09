---
name: frontend-quality-review
description: Review a frontend change against its requirements, architecture, accessibility, performance, and regression risk before completion.
---

# Frontend Quality Review

Adapted from Ruflo's MIT-licensed verification and SPARC refinement skills for a standard web-project toolchain. It does not require Ruflo CLI or MCP services.

## When to use

Use after implementing or substantially changing a frontend feature, before reporting it complete.

## Workflow

1. Restate the user-visible acceptance criteria as a compact checklist.
2. Inspect the changed files and the surrounding design-system conventions.
3. Review for:
   - Functional correctness and complete states.
   - Semantic HTML, keyboard access, focus visibility, and reduced-motion support.
   - Responsive behavior, overflow, clipping, and stable component dimensions.
   - Avoidable layout work, continuous offscreen animation, expensive filters, and oversized media.
   - Dead styles, duplicated logic, magic values, and divergence from shared tokens.
4. Run the smallest relevant automated checks available in the project.
5. Exercise the affected flow in a real browser at desktop and mobile widths.
6. Capture screenshots of the changed region and inspect them visually.
7. Report only verified outcomes. If a check cannot be performed, state the limitation.

## Completion gate

- No critical runtime or console errors.
- No horizontal overflow at tested widths.
- Primary actions work with pointer and keyboard input.
- Reduced-motion behavior is usable when animation was changed.
- The implementation matches every acceptance criterion.
- Any remaining issue is explicitly disclosed.