# Toolbar — Disabled

> One example from the [Toolbar](../components/toolbar.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A disabled `[rdxToolbarButton]` stays focusable by default (`focusableWhenDisabled`) so keyboard and
screen-reader users can still reach it.

```html
<div class="${rootClass}" rdxToolbarRoot aria-label="Formatting options">
    <button class="${buttonClass}" rdxToolbarButton>Bold</button>
    <button class="${buttonClass}" rdxToolbarButton disabled>Italic</button>
    <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>
    <button class="${buttonClass}" rdxToolbarButton>Underline</button>
</div>
```
