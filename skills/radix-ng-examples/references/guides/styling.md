# Styling guide for demos

Radix NG primitives are **headless** — directives carry no styles. The styling you see in
Storybook lives entirely in the demos. This page is the single source of truth for how those demos
look, so examples stay consistent instead of each story reinventing its own classes.

The Base UI Tailwind hero demos provide the visual reference. The shared stylesheet defines
their neutral and accent palette alongside the light and dark semantic tokens. [Base UI demos](https://base-ui.com/react/components/switch)

## Rules

1. **Use Tailwind v4 utilities** directly in templates. No story-local CSS files, no `styleUrl` /
   `styles`, no inline `<style>` or `style="…"`. (Documented exceptions: CSS custom properties for
   animation dimensions.)
2. **Keep shared styles in one place.** Theme values belong in `@theme`. Stable combinations of
   classes that should change together may use `@apply` in the shared `@layer components`.
   Keep sizes, spacing, layout and state utilities specific to an example visible in its template.
   Reuse the common classes from `demo-styles.css`.
3. **Reach for semantic tokens first** — `bg-background`, `text-foreground`, `bg-muted`,
   `bg-popover`, `border-border`, `text-primary-foreground`, `ring-ring`. Pair palette utilities with
   `dark:` when a part calls for a specific light and dark shade, such as
   `bg-neutral-200 dark:bg-neutral-800` on a progress track. Semantic tokens and `dark:` both follow
   `[data-theme]`.
4. **Wrap demos** with `tailwindDemoDecorator()` (or keep `data-demo="tailwind"` on the outermost
   container) so Tailwind preflight and the theme variables stay active.
5. **Type dynamic variants in TS** and use full class names (for example, a typed map of
   `compact: 'w-64 p-3'` and `comfortable: 'w-80 p-4'`). Tailwind cannot discover interpolated
   fragments such as `w-${size}`.

## The style layer

Storybook and Playground share `apps/radix-storybook/.storybook/main.css`, which imports
`demo-styles.css`. That portable stylesheet owns the theme, common recipes and keyframes.

| Class | Purpose |
| --- | --- |
| `demo-button` | Button appearance, intrinsic alignment, shared focus and disabled states. |
| `demo-button-primary`, `demo-button-outline`, … | One button color variant. |
| `demo-input` | Text input appearance and shared focus. |
| `demo-focus` | Focus-visible ring for controls outside the button and input recipes. |
| `demo-surface` | Card or panel colors, border, rounding and shadow. |
| `demo-popup`, `demo-popup-motion` | Square popup surface and optional open/close transitions. Apply motion to the part whose lifetime the primitive tracks. |
| `demo-popup-arrow` | Theme-matched diamond inside the positioned arrow part. |
| `demo-arrow` | Common popup arrow fill and border shadow. |
| `demo-label` | Shared label typography. |
| `demo-select-*`, `demo-combobox-*`, … | Appearance shared by parts of one family. |

Sizes, spacing, content layout and state rules specific to an example stay in the template:

```html
<button rdxButton class="demo-button demo-button-primary h-9 px-4">Primary</button>
<button rdxButton class="demo-button demo-button-outline h-8 px-3 text-xs">Outline</button>
<input rdxInput class="demo-input h-9 w-full px-3" />
<div
  rdxPopoverPopup
  class="demo-popup demo-popup-motion relative w-72 max-w-(--available-width) p-4"
>…</div>
```

The button variants are `primary`, `secondary`, `outline`, `ghost` and `destructive`. Sizes are
ordinary utilities on each example. `demo-button` handles native `disabled`, `data-disabled` and
`aria-disabled`. Button and input recipes use an inset focus outline.

Utilities have priority over `components`. Local `bg-muted`, `border-transparent`, `shadow-none`
or size utilities override the corresponding common defaults regardless of class-string order.

## Copy an example into your app

Install `@radix-ng/primitives` and any additional packages listed under **Example files** on the
component page. Copy the standalone component from **Show code** and any local files listed in
that section. Preserve their relative paths, then import the component into its parent and use
its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss` for Tailwind v4. Configure the PostCSS plugin.

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the stylesheet below as `demo-styles.css` next to your global stylesheet. Import Tailwind first.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

Set `data-theme="dark"` on `<html>` for the dark theme. The stylesheet includes theme tokens, shared
classes and animation keyframes. Its font stacks include system fallbacks. You can self-host Inter
and JetBrains Mono to match Storybook typography.

Use the explicit public directive imports shown in the example so Angular can compile it against
the installed package.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-button-default-example',
    imports: [RdxButtonDirective],
    template: `
        <button class="demo-button demo-button-outline h-8 px-3 leading-none" rdxButton>Button</button>
    `
})
export class ButtonDefaultStory {}
```

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>

## Positioning popups: put `z-index` on the positioner

Popper-based popups (Combobox, Select, Popover, Menu, Tooltip, …) render a **positioner** wrapper
(`RdxPopperContentWrapper`) around the **popup** content (`RdxPopperContent`). The positioner is the
element teleported into the body and given a `position: fixed`/`absolute`, so it is the natural owner
of the stacking `z-index` — Base UI places it there too.

Practical rule: **set the stacking `z-*` on the positioner element, not the popup.**

```html
<!-- ✅ z on the positioner -->
<div rdxComboboxPositioner class="z-50 w-64">
  <div rdxComboboxPopup class="…">…</div>
</div>
```

This matters most in **modal** mode: a `Backdrop` (e.g. `z-40`) must sit *below* the popup. Putting
the `z-*` on the positioner keeps the whole popup above the backdrop.

> **Migration (ADR 0012).** Earlier versions copied the popup's computed `z-index` onto the
> positioner, so the guidance was the inverse ("put `z-*` on the popup"). The positioner no longer
> copies anything; if you set the stacking `z-*` on the popup, move it up one element to the
> positioner. Combobox templates place `z-50` on the positioner for this reason.
