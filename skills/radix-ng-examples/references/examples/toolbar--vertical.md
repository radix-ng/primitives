# Toolbar — Vertical

> One example from the [Toolbar](../components/toolbar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Set `orientation="vertical"` to lay the toolbar out vertically (arrow navigation switches to Up/Down).

```html
<div
    class="${rootClass} flex-col items-stretch"
    rdxToolbarRoot
    orientation="vertical"
    aria-label="Formatting options"
>
    <div
        class="flex flex-col gap-1"
        rdxToggleGroupWithoutFocus
        [value]="alignment"
        aria-label="Text alignment"
    >
        <button class="${toggleClass}" rdxToggle value="left" aria-label="Align left">
            <svg lucideTextAlignStart size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="center" aria-label="Align center">
            <svg lucideTextAlignCenter size="16"></svg>
        </button>
        <button class="${toggleClass}" rdxToggle value="right" aria-label="Align right">
            <svg lucideTextAlignEnd size="16"></svg>
        </button>
    </div>
    <div class="bg-border mx-1 my-1 h-px" rdxToolbarSeparator orientation="horizontal"></div>
    <button class="${buttonClass}" rdxToolbarButton>Share</button>
</div>
```
