# Radix NG Landing / Docs / Playground Plan

Working note for the landing-page integration. This file is intentionally local
planning state; do not commit it unless the team decides it should become
project documentation.

## Target URL Map

- `/` -> new landing page.
- `/docs` -> Storybook.
- `/docs/*` -> Storybook static assets and deep links.
- `/playground` -> existing playground home.
- `/playground/*` -> existing playground primitive pages.

## Source Material

Archive:

```txt
/Users/pimenovoleg/Downloads/Radix NG Design System.zip
```

Important files inside the archive:

- `design_handoff_docs_landing/README.md`
- `design_handoff_docs_landing/docs-landing.html`
- `design_handoff_docs_landing/styles.css`
- `design_handoff_docs_landing/tokens/*.css`
- `design_handoff_docs_landing/assets/icons.css`
- `design_handoff_docs_landing/assets/logo-mark.svg`
- `design_handoff_docs_landing/assets/logo-wordmark.svg`

The archive is a high-fidelity HTML handoff, not production code to paste as-is.
Preserve section order, copy, layout intent, and visual weight. Re-express the
page in Angular + Tailwind v4 using project conventions.

## Constraints

- Use `apps/radix-playground` as the root application. Do not create another app.
- Keep the existing playground available under `/playground`.
- Use Tailwind v4 utilities and the existing shared theme approach.
- Avoid story-local CSS patterns, inline `style=""`, Angular `styles`, and local
  style files for the landing implementation unless there is a clear exception.
- Prefer existing semantic tokens: `bg-background`, `text-foreground`,
  `bg-muted`, `border-border`, `text-primary-foreground`, etc.
- Add small landing-specific theme tokens only where the current palette lacks a
  close match.
- Use real Radix NG primitives in the interactive landing playground where
  practical.
- Use existing components/directives such as `rdxButton`, switch, checkbox, and
  accordion instead of plain JS behavior.

## Current Repository Context

- `apps/radix-playground` already has Angular routing.
- Current playground routes are root-level:
  - `/`
  - `/accordion`
  - `/checkbox`
  - `/dialog`
  - `/popover`
  - `/select`
  - `/slider`
  - `/switch`
  - `/tabs`
- `apps/radix-playground/src/styles.css` already imports the Storybook Tailwind
  theme:

```css
@import '../../radix-storybook/.storybook/tailwind.css';
```

- `apps/radix-storybook` currently builds Storybook to `dist/radix-storybook`.
- No `vercel.json` was found in the repo at planning time, so Vercel is probably
  configured in the Vercel UI.

## Implementation Plan

1. Refactor `apps/radix-playground` routing.
   - `''` loads the new landing page.
   - `'playground'` loads a playground shell with the existing sidebar layout.
   - existing primitive pages move under `/playground/*`.
   - wildcard should redirect to `''` or a simple not-found decision.

2. Split the current playground shell out of `App`.
   - Keep `App` thin: global setup plus `<router-outlet />`.
   - Move sidebar/nav/current layout into a `PlaygroundShell` component.
   - Preserve the existing playground `HomePage` as `/playground`.

3. Build the landing page component.
   - Suggested path: `apps/radix-playground/src/app/pages/landing.ts` or
     `apps/radix-playground/src/app/landing/landing.page.ts`.
   - Preserve handoff sections:
     - hero
     - interactive playground
     - composition
     - primitives
     - contributors
     - footer
   - Preserve copy from `docs-landing.html` as closely as possible.
   - Use Tailwind utilities for layout, spacing, color, responsive behavior, and
     interactions.

4. Implement landing behavior with Angular signals.
   - Theme toggle updates `document.documentElement.dataset.theme`.
   - Copy buttons use `navigator.clipboard.writeText(...)` and transient copied
     state.
   - Switch/checkbox/accordion state comes from actual primitives where possible.

5. Use project primitives/components.
   - `RdxButtonDirective` for buttons/links where applicable.
   - Switch primitives for the switch demo.
   - Checkbox primitives for the checkbox demo.
   - Accordion primitives for the accordion demo.
   - Use lucide icons where they match the design well; use the logo SVG from
     the archive for brand mark if needed.

6. Add minimal Tailwind theme additions if needed.
   - Candidate tokens:
     - `accent-9`
     - `accent-10`
     - `accent-11`
     - shadows/radii only if existing utilities are insufficient.
   - Prefer mapping these to the current palette rather than copying the entire
     handoff token system.

7. Create a combined static site build.
   - Landing/playground app goes to final deploy root.
   - Storybook goes to `docs/` inside the same final output.
   - Target final structure:

```txt
dist/radix-site/
  index.html
  assets/
  docs/
    index.html
    iframe.html
    index.json
    assets/
```

8. Update package/Nx scripts.
   - Add a script like `build-site`.
   - It should build `radix-playground` and `radix-storybook`, then compose
     outputs into `dist/radix-site`.

9. Add Vercel routing config if needed.
   - `/docs` should redirect to `/docs/`.
   - `/docs/*` should serve Storybook static files.
   - `/playground` and `/playground/*` should rewrite to Angular `index.html`.
   - `/` should serve the landing page.

10. Verify locally.
    - Build the combined site.
    - Serve `dist/radix-site`.
    - Check:
      - `/`
      - `/docs/`
      - `/docs/?path=/docs/overview-introduction--docs`
      - `/playground`
      - `/playground/switch`

## Technical Risks

- Storybook may need a base/public path adjustment to run correctly under
  `/docs/`.
- Storybook deep links and static assets must not be captured by Angular
  rewrites.
- Existing playground root links must be updated from `/accordion` to
  `/playground/accordion`, etc.
- The handoff prototype includes inline styles and a large `<style>` block; these
  must be converted to Tailwind utilities rather than copied directly.
- Contributor names/stats in the handoff are placeholder data. Keep placeholders
  for the first pass unless real GitHub data is explicitly requested.

## First Prototype Check

Before porting the full landing UI, validate the deployment shape:

1. Move current playground under `/playground`.
2. Add a minimal placeholder landing at `/`.
3. Build Storybook into `/docs`.
4. Compose the final `dist/radix-site`.
5. Serve it locally and confirm `/`, `/docs/`, and `/playground` all work.

Once this is proven, port the high-fidelity landing.
