# Toggle — Controlled

> One example from the [Toggle](../components/toggle.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Bind `[(pressed)]` (or `[pressed]` + `(onPressedChange)`) to control the state.

```html
<div class="flex flex-col items-center gap-3">
    <button class="${toggleClass}" [(pressed)]="pressed" rdxToggle aria-label="Toggle italic">
        <svg class="flex" lucideItalic size="12"></svg>
    </button>
    <span class="text-muted-foreground text-sm">pressed: {{ pressed }}</span>
</div>
```
