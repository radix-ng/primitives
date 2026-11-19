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

Storybook and Playground import `apps/radix-storybook/.storybook/main.css`. Its
`demo-styles.css` is the portable source for theme values, light/dark colors, common recipes and
keyframes. Put theme values and animation timings in `@theme`, and stable combinations that change
together in `@layer components` with `@apply`. Each common recipe has one declaration.

The shared controls are `.demo-button` plus one `.demo-button-*` variant, `.demo-input`,
`.demo-focus`, `.demo-surface`, `.demo-arrow` and `.demo-label`. Family recipes use names such as
`.demo-select-trigger`, `.demo-accordion-trigger` and `.demo-combobox-control`. The old TS recipes
and the Playground re-export have been removed after migrating their consumers.

Keep demo-specific sizes, spacing, layout and `data-*` rules on the element in its template:

```html
<button class="demo-button demo-button-primary h-9 px-4" rdxButton>Save</button>
<div
  class="demo-surface data-[open]:animate-popover-popup-in data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative w-80 p-4"
  rdxPopoverPopup
>
  …
</div>
```

Preserve the animated element and its state selectors when changing class storage: Portal lifetime
waits for that element's real motion. Check appearance, exit and reopening during exit in a browser.
For keyframe entry animations, keep the same animation on `data-open` after the transient
`data-starting-style` attribute clears; otherwise removing that attribute cancels the animation.
The ending-style rule selects the exit keyframes on the same element.
Utilities override the components layer, so local background, border, shadow and sizing overrides
have priority independent of class-string order.

Dynamic variants in TS use typed parameters and complete class names:

```ts
type DemoSize = 'compact' | 'comfortable';
const sizeClasses = {
  compact: 'w-64 p-3',
  comfortable: 'w-80 p-4'
} as const satisfies Record<DemoSize, string>;
const classesForSize = (size: DemoSize) => sizeClasses[size];
```

Use the shared demo shell in `packages/primitives/storybook/tailwind-demo.ts`. Story-local CSS,
component styles and inline style blocks remain outside this system.

## Copyable public source

Every affected standalone story supplies its own `?raw` component through `parameters.docs.source`.
Use explicit imports of the required directives from public `@radix-ng/primitives/*` entry points.
Published arrays such as `popoverImports` lack statically evaluable initializers in declarations;
spreading them in component metadata can pass Storybook but fail a consumer's AOT build.

The MDX **Setup and shared files** section lists dependencies, PostCSS configuration and stylesheet
order (`tailwindcss` first, then `demo-styles.css`). Its `Source` blocks import the rendered CSS and
local wrapper/helper files with `?raw`. Include external HTML for `templateUrl` examples. Preserve
relative paths when copying multiple files. The consumer Markdown pipeline appends this same setup
to each example shard with the wrapper sources and a link to the shared `demo-styles.css` file
in the bundle.

Run the [external portability check](../../tools/storybook-portability/README.md) against an installed
tarball. It compiles all selected examples with strict Angular templates and Tailwind v4 outside
the workspace; a Storybook build alone does not establish copyability.

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
