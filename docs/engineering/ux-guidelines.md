---
name: ux-guidelines
description: Demo styling, semantic tokens, animation patterns, and accessibility conventions for Radix NG stories
metadata:
  type: project
---

# UX Guidelines

These apply to the Storybook demo/story layer — not to primitives themselves (which are always headless).

## Documentation navigation

Storybook docs chrome is shared in `.storybook/docs-navigation.ts` and `docs-navigation.css` under
`apps/radix-storybook`. Keep long prose headings and URL anchors intact; add concise TOC labels to
the shared mapping when needed. The TOC expands the active h2 section and becomes a keyboard
disclosure below 1100px of available preview width. Global docs CSS belongs in that chrome layer,
never in story/demo styles. `pnpm test-browser:docs` verifies real layouts, keyboard access and
existing links in Chromium, Firefox and WebKit, including the manager sidebar on laptop widths.

## Demo styling system

The shared entry stylesheet is `apps/radix-storybook/.storybook/main.css`. Theme values belong
in `@theme`. Use `@apply` in the shared `@layer components` for stable combinations that should
change together. The `.demo-surface` rule lives in `demo-styles.css`. The existing
`demoCard` export in `packages/primitives/storybook/styles.ts` is a compatibility alias for that
class, also consumed by Playground through its shared stylesheet and TS re-export.

Keep sizes, spacing, layout and state variants specific to a demo visible on its template elements.
For example, Default Popover uses:

```html
<div
  class="demo-surface data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative w-80 p-4"
  rdxPopoverPopup
>
  …
</div>
```

The animation names and timings stay in `@theme`. Utilities override the components layer, so a
consumer can use `bg-muted`, `border-transparent` or `shadow-none` on `.demo-surface` without
depending on class-string order. `cn` only joins conditional strings; it does not merge conflicts.

Other existing recipes remain in `packages/primitives/storybook/styles.ts` (`demoFocusRing`,
`demoButton`, `demoInput`, etc.). This pilot migrates only `demoCard` and Default Popover.

In standalone story components, expose constants and bind via `[class]`:

- `protected readonly cn = cn;`
- `protected readonly b = demoButton;`
- Template: `<button [class]="cn(b.base, b.primary, b.size.md)">`

When a demo needs dynamic variants in TS, use typed parameters and complete class names so
Tailwind can discover them. Do not construct fragments such as `` `w-${size}` ``:

```ts
type DemoSize = 'compact' | 'comfortable';
const sizeClasses = {
  compact: 'w-64 p-3',
  comfortable: 'w-80 p-4'
} as const satisfies Record<DemoSize, string>;
const classesForSize = (size: DemoSize) => sizeClasses[size];
```

No story-local CSS files, component `styles` / `styleUrl`, inline `<style>` or `style="…"`.
Use the shared demo shell in `packages/primitives/storybook/tailwind-demo.ts`.

For a portable example, use public imports in the component source shown by **Show code**.
Default Popover uses the shared `demo-styles.css`, which supplies the semantic colors,
`.demo-surface` and popup animation tokens. Its MDX displays that stylesheet with a `?raw` import
and a `Source` block alongside the component. The consumer docs generator exports both blocks.

## Semantic tokens (Tailwind v4)

Defined in `apps/radix-storybook/.storybook/demo-styles.css` for light and dark themes.

Use semantic tokens first, never raw palette colors:

- `bg-background`, `text-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-popover`, `text-popover-foreground`
- `bg-primary`, `text-primary-foreground`
- `bg-destructive`, `text-destructive-foreground`
- `border-border`, `ring-ring`

Avoid: `violet`, `mauve`, `black-a*`, hard-coded `white`/`black` when a token exists.

## Theme switching

Controlled from the Storybook toolbar (not OS `prefers-color-scheme`). The preview decorator sets `document.documentElement[data-theme]`. Stories must use tokens that respond to `[data-theme]`.

## Animation patterns

| Scenario                                 | API to use                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Always-mounted parts                     | CSS transitions driven by the boolean state attributes (`data-open`/`data-closed`, `data-checked`, …)               |
| App-owned `@if` DOM                      | Angular 21+ `animate.enter` / `animate.leave`                                                                       |
| Presence / `*rdxXxxPortal`-mounted parts | Exit keyframes or transitions on registered Popup/Backdrop/Panel elements and explicit `rdxPresenceTarget` elements |

Since [ADR 0084](../adr/0084-signal-render-lifecycle.md), a shared signal-owned lifetime waits for finite
WAAPI animations on explicit participants. Popup, Backdrop and Panel register automatically; standalone
Presence observes its roots. Add `rdxPresenceTarget` to include another animated element. Reopening
keeps the same Angular view; unrelated descendant animations do not delay removal. Do not use
`@angular/animations` (legacy).

## Accessibility in demos

- Every `<label>` must be programmatically connected to its control
- Use `for`/`id` for native controls
- Use `htmlFor` on `RdxLabelDirective`, or `rdxFieldLabel` inside `rdxFieldRoot`
- Do not leave a visual label next to an input/checkbox/radio/switch without a programmatic association

## Form demo composition

For form demos, prefer: `fieldset[rdxFieldsetRoot]` → `rdxFieldRoot` → `rdxFieldLabel` + `rdxFieldDescription` + `rdxFieldError` + `input[rdxInput]` or other compatible control.

This structure shows real accessible form patterns and exercises the Field/Fieldset primitives together.

## Icon usage

- Static icons: `<svg lucideCheck />` with `LucideCheck` import (standalone SVG directive from `@lucide/angular`)
- Dynamic icons: `<svg [lucideIcon]="icon" />` with `LucideDynamicIcon`; dynamic string names must be registered via `provideLucideIcons(...)` in `apps/radix-storybook/.storybook/preview.ts`

## Visual reference

[coss.com/ui](https://coss.com/ui) — use as visual reference when designing demos and demo styles.
