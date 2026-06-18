# Toggle Group

#### A set of two-state buttons that can be toggled on or off.

```html
<div class="${groupClass}" [value]="value" rdxToggleGroup aria-label="Text alignment">
    <button class="${itemClass}" rdxToggle value="left" aria-label="Left aligned">
        <svg class="flex" lucideAlignLeft size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
        <svg class="flex" lucideAlignCenter size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
        <svg class="flex" lucideAlignRight size="12"></svg>
    </button>
</div>
```

## Features

- ✅ Full keyboard navigation with composite focus.
- ✅ Supports horizontal and vertical orientation.
- ✅ Single or multiple pressed items.
- ✅ Can be controlled or uncontrolled.

## Import

```typescript
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';
import { RdxToggle } from '@radix-ng/primitives/toggle';
```

The API follows [Base UI Toggle Group](https://base-ui.com/react/components/toggle-group): a
`ToggleGroup` whose children are plain `Toggle` items. The group `value` is always an array.

## Anatomy

```html
<div rdxToggleGroup [value]="['center']" aria-label="Text alignment">
    <button rdxToggle value="left"></button>
    <button rdxToggle value="center"></button>
    <button rdxToggle value="right"></button>
</div>
```

## Change events

`onValueChange` emits `{ value, eventDetails }`, where `value` is the next array of pressed item
values. Call `eventDetails.cancel()` to reject the change.

```html
<div [value]="value()" (onValueChange)="setValue($event)" rdxToggleGroup>
    ...
</div>
```

```ts
setValue(change: RdxToggleGroupValueChangeEvent) {
    if (this.locked()) {
        change.eventDetails.cancel();
        return;
    }

    this.value.set(change.value);
}
```

## Examples

### Multiple

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

### Disabled

Disable a single `[rdxToggle]` with `disabled`, or the whole group with `disabled` on the root.

```html
<div class="${groupClass}" [value]="value" rdxToggleGroup aria-label="Text alignment">
    <button class="${itemClass}" rdxToggle value="left" disabled aria-label="Left aligned">
        <svg class="flex" lucideAlignLeft size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
        <svg class="flex" lucideAlignCenter size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
        <svg class="flex" lucideAlignRight size="12"></svg>
    </button>
</div>
```

```html
<div class="${groupClass}" [value]="value" rdxToggleGroup disabled aria-label="Text alignment">
    <button class="${itemClass}" rdxToggle value="left" aria-label="Left aligned">
        <svg class="flex" lucideAlignLeft size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="center" aria-label="Center aligned">
        <svg class="flex" lucideAlignCenter size="12"></svg>
    </button>
    <button class="${itemClass}" rdxToggle value="right" aria-label="Right aligned">
        <svg class="flex" lucideAlignRight size="12"></svg>
    </button>
</div>
```

### Two-way binding

Bind `[(value)]` to read and write the pressed values.

```html
<toggle-group />
```

## API Reference

### Root

`RdxToggleGroup`

| Data attribute       | Value                          |
| -------------------- | ------------------------------ |
| `[data-orientation]` | `"horizontal" \| "vertical"`   |
| `[data-disabled]`    | Present when the group is disabled. |
| `[data-multiple]`    | Present when multiple selection is enabled. |

### Item

`RdxToggle` — see the [Toggle](?path=/docs/primitives-toggle--docs) page. Each item needs a stable
`value`. In dev mode, a grouped toggle without `value` emits a warning because the group cannot derive
or update its pressed state.

### WithoutFocus

`RdxToggleGroupWithoutFocus`

Use `rdxToggleGroupWithoutFocus` inside a composite parent that already owns focus, such as
`rdxToolbarRoot`. It keeps the same value, disabled, orientation and multiple-selection behavior as
`rdxToggleGroup`, but lets its toggles register with the ancestor composite root. When placed inside
`rdxToolbarRoot` or `rdxToolbarGroup`, disabled state cascades into the toggle group and its items.

## Accessibility

Uses composite focus with a single item tab stop to manage focus among items.

### Keyboard Interactions

| Key          | Description                                        |
| ------------ | -------------------------------------------------- |
| `Tab`        | Moves focus to the pressed item or the first item. |
| `Space`      | Activates/deactivates the focused item.            |
| `Enter`      | Activates/deactivates the focused item.            |
| `ArrowDown`  | Moves focus to the next item.                      |
| `ArrowRight` | Moves focus to the next item.                      |
| `ArrowUp`    | Moves focus to the previous item.                  |
| `ArrowLeft`  | Moves focus to the previous item.                  |
| `Home`       | Moves focus to the first item.                     |
| `End`        | Moves focus to the last item.                      |
