# Styling guide for demos

Radix NG primitives are **headless** — directives carry no styles. The styling you see in
Storybook lives entirely in the demos. This page is the single source of truth for how those demos
look, so examples stay consistent instead of each story reinventing its own classes.

Visual reference: [coss.com](https://coss.com/ui) (Base UI + Tailwind). The Storybook theme in
`apps/radix-storybook/.storybook/tailwind.css` is already built on this token set.

## Rules

1. **Use Tailwind v4 utilities** directly in templates. No story-local CSS files, no `styleUrl` /
   `styles`, no inline `<style>` or `style="…"`. (Documented exceptions: CSS custom properties for
   animation dimensions.)
2. **Reuse the shared constants** from `packages/primitives/storybook/styles.ts` instead of
   copy-pasting long class strings. If you find yourself writing the same button/card classes
   twice, add or extend a constant there.
3. **Reach for semantic tokens first** — `bg-background`, `text-foreground`, `bg-muted`,
   `bg-popover`, `border-border`, `text-primary-foreground`, `ring-ring`. Avoid raw Radix theme
   colors (`violet`, `mauve`, `black-a*`) or hard-coded `white`/`black` when a token exists. These
   tokens respond to the Storybook **theme toolbar** (light/dark), so demos work in both.
4. **Wrap demos** with `tailwindDemoDecorator()` (or keep `data-demo="tailwind"` on the outermost
   container) so Tailwind preflight and the theme variables stay active.

## The style layer

`packages/primitives/storybook/styles.ts` exports documented constants:

| Export          | Purpose                                                    |
| --------------- | --------------------------------------------------------- |
| `cn(...)`       | Join conditional class strings, dropping falsy values.    |
| `demoFocusRing` | Shared `focus-visible` ring matching the `--ring` token.  |
| `demoButton`    | `base` + a `variant` + a `size` for buttons.              |
| `demoCard`      | Card / panel surface (popovers, list rows, content boxes).|
| `demoInput`     | Text input surface.                                       |

### Buttons

Compose one variant and one size on top of `base`:

```ts
import { cn, demoButton } from '../../storybook/styles';

// in a component:
protected readonly cn = cn;
protected readonly b = demoButton;
```

```html
<button rdxButton [class]="cn(b.base, b.primary, b.size.md)">Primary</button>
<button rdxButton [class]="cn(b.base, b.outline, b.size.sm)">Outline</button>
<button rdxButton aria-label="Add" [class]="cn(b.base, b.ghost, b.size.icon)">
  <svg lucidePlus size="16" />
</button>
```

Variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`.
Sizes: `sm`, `md`, `lg`, `icon`.

`demoButton.base` already styles the disabled look for both the native `disabled` attribute and the
headless `data-disabled` attribute, so it pairs directly with `RdxButtonDirective`.

See the **Primitives/Button** story for the live reference. Other primitives are migrated onto this
layer in follow-up changes.

## Positioning popups: put `z-index` on the popup, not the positioner

Popper-based popups (Combobox, Select, Popover, Menu, Tooltip, …) render a **positioner** wrapper
(`RdxPopperContentWrapper`) around the **popup** content (`RdxPopperContent`). The positioner copies
the popup's computed `z-index` onto itself via an inline style — so it can sit above sibling layers —
and that inline value **overrides any `z-index` class you put on the positioner**.

Practical rule: **set the stacking `z-*` on the popup element, not the positioner.**

```html
<!-- ✅ z on the popup -->
<div rdxComboboxPositioner class="w-64">
  <div rdxComboboxPopup class="z-50 …">…</div>
</div>

<!-- ❌ z on the positioner is overwritten to `auto` (the popup has no z), so a backdrop/overlay
        with a higher z ends up on top and swallows clicks -->
<div rdxComboboxPositioner class="z-50 w-64">
  <div rdxComboboxPopup class="…">…</div>
</div>
```

This matters most in **modal** mode: a `Backdrop` (e.g. `z-40`) must sit *below* the popup. If the
popup's z lands on the wrong element, the backdrop covers the popup and items become unclickable.
The shared `demoCombobox` constants already place `z-50` on `popup` for this reason.
