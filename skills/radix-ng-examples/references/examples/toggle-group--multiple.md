# Toggle Group — Multiple

> One example from the [Toggle Group](../components/toggle-group.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Set `multiple` to allow more than one item to be pressed at the same time.

```html
<div class="${groupClass}" [value]="value" rdxToggleGroup multiple aria-label="Text formatting">
    <button class="${itemClass}" rdxToggle value="bold" aria-label="Bold">
        <svg class="flex" lucideBold size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="italic" aria-label="Italic">
        <svg class="flex" lucideItalic size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="underline" aria-label="Underline">
        <svg class="flex" lucideUnderline size="12"></svg>
    </button>
</div>
```
