# Toggle

#### A two-state button that can be either on or off.

```html
<button class="${toggleClass}" rdxToggle aria-label="Toggle italic">
    <svg class="flex" lucideItalic size="12"></svg>
</button>
```

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Full keyboard navigation.
- ✅ Works standalone or as an item of a Toggle Group.

## Import

```typescript
import { RdxToggle } from '@radix-ng/primitives/toggle';
```

The API follows [Base UI Toggle](https://base-ui.com/react/components/toggle): a single `Toggle`
part used either on its own or inside a `[rdxToggleGroup]`.

## Anatomy

```html
<button rdxToggle aria-label="Toggle italic">
    <icon />
</button>
```

When placed inside a `[rdxToggleGroup]`, give each toggle a `value` — its pressed state is then
derived from the group's value and it joins the group's roving focus.

## Examples

### Pressed by default

Use `defaultPressed` for an uncontrolled toggle that starts pressed.

```html
<button class="${toggleClass}" rdxToggle defaultPressed aria-label="Toggle italic">
    <svg class="flex" lucideItalic size="12"></svg>
</button>
```

### Controlled

Bind `[(pressed)]` (or `[pressed]` + `(onPressedChange)`) to control the state.

```html
<div class="flex flex-col items-center gap-3">
    <button class="${toggleClass}" [(pressed)]="pressed" rdxToggle aria-label="Toggle italic">
        <svg class="flex" lucideItalic size="12"></svg>
    </button>
    <span class="text-muted-foreground text-sm">pressed: {{ pressed }}</span>
</div>
```

### Disabled

When `disabled` is present the toggle cannot be activated.

```html
<button class="${toggleClass}" rdxToggle disabled aria-label="Toggle italic">
    <svg class="flex" lucideItalic size="12"></svg>
</button>
```

## API Reference

### Toggle

`RdxToggle`

| Data attribute    | Value                          |
| ----------------- | ------------------------------ |
| `[data-pressed]`  | Present when the toggle is on. |
| `[data-disabled]` | Present when disabled.         |

## Accessibility

### Keyboard Interactions

| Key     | Description                       |
| ------- | --------------------------------- |
| `Space` | Activates/deactivates the toggle. |
| `Enter` | Activates/deactivates the toggle. |
