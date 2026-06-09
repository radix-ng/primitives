# Styling Radix NG Primitives

The primitives are **headless**: they ship no styles. You own all visuals and drive them from the
`data-*` state attributes the directives expose. The same primitive works with Tailwind, CSS
modules, vanilla CSS, or any token system — only your class strings change.

Look up a primitive's exact parts and attributes in `styling-contract.json`.

## The rule

1. Put your own classes on each part of the anatomy.
2. Express **state** through the data attributes, never by reaching into internal classes.
3. Removed attributes are absent (not `false`/`null`) — style on presence.

## Common state attributes

| Attribute                  | Meaning                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `data-state`               | `"open"`/`"closed"`, `"checked"`/`"unchecked"`, `"on"`/`"off"`, `"active"/"inactive"`, … |
| `data-disabled`            | present when disabled                                                                    |
| `data-orientation`         | `"horizontal"` / `"vertical"`                                                            |
| `data-highlighted`         | present on the keyboard-/pointer-highlighted item                                        |
| `data-side` / `data-align` | popper placement (popover, tooltip, menu, select)                                        |

The contract lists the real, per-primitive set — don't assume an attribute exists.

## Tailwind v4

```html
<button
  class="data-[state=open]:bg-accent flex w-full justify-between rounded px-4 py-2 data-[disabled]:opacity-50 [&[data-state=open]_svg]:rotate-180"
  rdxAccordionTrigger
>
  …
</button>
```

## Plain CSS / design tokens

```css
[rdxAccordionTrigger] {
  padding: var(--space-2) var(--space-4);
}
[rdxAccordionTrigger][data-state='open'] {
  background: var(--color-accent);
}
[rdxAccordionTrigger][data-disabled] {
  opacity: 0.5;
}
```

## Animation

- **Always-mounted parts** (e.g. a trigger chevron): CSS transitions keyed off `data-state`.
- **Conditionally rendered DOM** you own with `@if`: Angular `animate.enter` / `animate.leave`.
- **Parts mounted via `RdxPresenceDirective`** (popover/dialog/tooltip content): exit
  `@keyframes` driven by `data-state="closed"` — presence waits for `animationend`.

```css
[rdxAccordionContent][data-state='open'] {
  animation: slide-down 200ms ease-out;
}
[rdxAccordionContent][data-state='closed'] {
  animation: slide-up 200ms ease-out;
}
```

Some content parts expose CSS variables for measured dimensions (e.g.
`--rdx-accordion-content-height`) — use them in keyframes. Check the primitive's `.md`.

## Dark mode

Style with semantic tokens (your own `--color-*` / Tailwind theme) and let your app toggle the
theme. The primitives don't read `prefers-color-scheme`; theme switching is your concern.
