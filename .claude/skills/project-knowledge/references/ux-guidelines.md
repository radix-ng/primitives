---
name: ux-guidelines
description: Demo styling, semantic tokens, animation patterns, and accessibility conventions for Radix NG stories
metadata:
  type: project
---

# UX Guidelines

These apply to the Storybook demo/story layer — not to primitives themselves (which are always headless).

## Demo styling system

**Source of truth:** `packages/primitives/storybook/styles.ts`

Exports: `cn` (tailwind-merge helper), `demoFocusRing`, `demoButton`, `demoCard`, `demoInput`.

In standalone story components, expose constants and bind via `[class]`:

- `protected readonly cn = cn;`
- `protected readonly b = demoButton;`
- Template: `<button [class]="cn(b.base, b.primary, b.size.md)">`

Never inline long Tailwind class strings in templates — reference the shared constants.

## Semantic tokens (Tailwind v4)

Defined in `apps/radix-storybook/.storybook/tailwind.css` (light + dark + `@theme`). Default Tailwind palettes are stripped inside `[data-demo="tailwind"]`.

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

| Scenario                             | API to use                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| Always-mounted parts                 | CSS transitions driven by `data-state`                                          |
| App-owned `@if` DOM                  | Angular 21+ `animate.enter` / `animate.leave`                                   |
| `RdxPresenceDirective`-mounted parts | Exit CSS `@keyframes` driven by `data-state`; presence waits for `animationend` |

Do not use `@angular/animations` (legacy). Do not mix transition + animation for presence-managed elements.

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
