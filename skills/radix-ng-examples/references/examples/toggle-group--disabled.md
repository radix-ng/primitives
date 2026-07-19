# Toggle Group — Disabled

> One example from the [Toggle Group](../components/toggle-group.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Disable a single `[rdxToggle]` with `disabled`, or the whole group with `disabled` on the root.

```html
<div class="${groupClass}" [value]="value" rdxToggleGroup aria-label="Text alignment">
    <button class="${itemClass}" rdxToggle value="left" disabled aria-label="Left aligned">
        <svg class="flex" lucideTextAlignStart size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
        <svg class="flex" lucideTextAlignCenter size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
        <svg class="flex" lucideTextAlignEnd size="12"></svg>
    </button>
</div>
```

```html
<div class="${groupClass}" [value]="value" rdxToggleGroup disabled aria-label="Text alignment">
    <button class="${itemClass}" rdxToggle value="left" aria-label="Left aligned">
        <svg class="flex" lucideTextAlignStart size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
        <svg class="flex" lucideTextAlignCenter size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
        <svg class="flex" lucideTextAlignEnd size="12"></svg>
    </button>
</div>
```
