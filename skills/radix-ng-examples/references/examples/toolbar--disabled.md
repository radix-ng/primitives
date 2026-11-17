# Toolbar — Disabled

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

A disabled `[rdxToolbarButton]` stays focusable by default (`focusableWhenDisabled`) so keyboard and
screen-reader users can still reach it.
Consumer click, pointerdown, mousedown, keydown and keyup handlers are suppressed while disabled.
Tab and arrow navigation remain available, as do hover and release handlers.

```html
<div class="${rootClass}" rdxToolbarRoot aria-label="Formatting options">
    <button class="${buttonClass}" rdxToolbarButton>Bold</button>
    <button class="${buttonClass}" rdxToolbarButton disabled>Italic</button>
    <div class="${separatorClass}" rdxToolbarSeparator orientation="vertical"></div>
    <button class="${buttonClass}" rdxToolbarButton>Underline</button>
</div>
```
