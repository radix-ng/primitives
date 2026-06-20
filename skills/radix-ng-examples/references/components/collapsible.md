# Collapsible

#### A collapsible panel controlled by a button.

```html
<div class="w-full max-w-sm" rdxCollapsibleRoot [open]="true" #collapsibleRoot="rdxCollapsibleRoot">
    <div class="flex items-center justify-between gap-3">
        <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
        <button
            class="bg-muted text-primary hover:bg-muted/80 focus-visible:ring-ring border-border inline-flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors outline-none focus-visible:ring-2"
            type="button"
            rdxCollapsibleTrigger
        >
            @if (collapsibleRoot.open()) {
            <svg class="flex" size="16" lucideX></svg>
            } @else {
            <svg class="flex" size="16" lucideUnfoldVertical></svg>
            }
        </button>
    </div>

    <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
        <span class="text-sm">&#64;radix-ui/primitives</span>
    </div>

    <div rdxCollapsiblePanel>
        <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
            <span class="text-sm">&#64;radix-ui/colors</span>
        </div>
        <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
            <span class="text-sm">&#64;stitches/react</span>
        </div>
    </div>
</div>
```

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Full keyboard support.
- ✅ Exposes open/close state via `data-open` / `data-closed` for styling.
- ✅ Enter and exit transitions via `data-starting-style` / `data-ending-style`.
- ✅ Exposes the panel size as `--collapsible-panel-height` / `--collapsible-panel-width` for height/width animations.
- ✅ Closed panels unmount by default, matching Base UI.
- ✅ Optional `keepMounted` and `hiddenUntilFound` keep the closed panel in the DOM while hidden.
- ✅ Cancelable `onOpenChange` events include the reason, source event, and trigger.

## Import

Get started with importing the directives:

```typescript
import {
  RdxCollapsibleRootDirective,
  RdxCollapsibleTriggerDirective,
  RdxCollapsiblePanelDirective
} from '@radix-ng/primitives/collapsible';
```

## Anatomy

Assemble the collapsible from its parts.

```html
<div rdxCollapsibleRoot>
  <button rdxCollapsibleTrigger>Trigger</button>
  <div rdxCollapsiblePanel>Panel</div>
</div>
```

By default, a closed panel is removed from the DOM. Add `keepMounted` when the element must remain
mounted after the close transition, or `hiddenUntilFound` when collapsed content should remain
discoverable by browser find-in-page.

## Examples

### Keep mounted

With `keepMounted`, the closed panel stays in the DOM and receives `hidden` after the close
transition. During enter and exit, `data-starting-style` / `data-ending-style` can drive CSS motion.

```html
<div class="w-full max-w-sm" rdxCollapsibleRoot #collapsibleRoot="rdxCollapsibleRoot">
    <div class="flex items-center justify-between gap-3">
        <span class="text-foreground text-sm font-medium">&#64;peduarte starred 3 repositories</span>
        <button
            class="bg-muted text-primary hover:bg-muted/80 focus-visible:ring-ring border-border inline-flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors outline-none focus-visible:ring-2"
            type="button"
            rdxCollapsibleTrigger
        >
            @if (collapsibleRoot.open()) {
            <svg class="flex" size="16" lucideX></svg>
            } @else {
            <svg class="flex" size="16" lucideUnfoldVertical></svg>
            }
        </button>
    </div>

    <div class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm">
        <span class="text-sm">&#64;radix-ui/primitives</span>
    </div>

    <div
        class="grid transition-[grid-template-rows] duration-300 ease-out data-[closed]:grid-rows-[0fr] data-[open]:grid-rows-[1fr]"
        rdxCollapsiblePanel
        [keepMounted]="true"
    >
        <div class="overflow-hidden">
            <div
                class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm"
            >
                <span class="text-sm">&#64;radix-ui/colors</span>
            </div>
            <div
                class="bg-card text-card-foreground border-border my-3 rounded-md border px-3 py-2 shadow-sm"
            >
                <span class="text-sm">&#64;stitches/react</span>
            </div>
        </div>
    </div>
</div>
```

### Animation

The panel exposes `--collapsible-panel-height` so its contents can animate open and closed.

```html
<rdx-collapsible-animation></rdx-collapsible-animation>
```

### External trigger

The open state can be controlled from outside the collapsible via the `open` model.

```html
<rdx-collapsible-external-triggering></rdx-collapsible-external-triggering>
```

## API Reference

### Root

`RdxCollapsibleRootDirective` — groups the trigger and panel and manages the open state. Apply to a container element (typically a `<div>`).

**Data attributes**

| Attribute       | Present when                  |
| --------------- | ----------------------------- |
| `data-open`     | The collapsible is open.      |
| `data-closed`   | The collapsible is closed.    |
| `data-disabled` | The collapsible is disabled.  |

### Trigger

`RdxCollapsibleTriggerDirective` — a button that toggles the panel. Apply to a native `<button>` element.

Reads everything from the root context; it exposes `aria-expanded` and, while open, `aria-controls`.
Disabled triggers remain focusable and expose `aria-disabled`.

**Data attributes**

| Attribute         | Present when                  |
| ----------------- | ----------------------------- |
| `data-panel-open`     | The panel is open.            |
| `data-disabled`       | The collapsible is disabled.  |
| `data-starting-style` | The panel is in the enter transition. |
| `data-ending-style`   | The panel is in the exit transition.  |

### Panel

`RdxCollapsiblePanelDirective` — the collapsible content. Unmounts when closed by default; `keepMounted` / `hiddenUntilFound` keep it in the DOM. Apply to a container element (typically a `<div>`).

**Data attributes**

| Attribute             | Present when                  |
| --------------------- | ----------------------------- |
| `data-open`           | The panel is open.            |
| `data-closed`         | The panel is closed.          |
| `data-starting-style` | The panel is in the enter transition. |
| `data-ending-style`   | The panel is in the exit transition.  |

**CSS variables**

| Variable                     | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `--collapsible-panel-height` | The panel's measured height, for height animations.  |
| `--collapsible-panel-width`  | The panel's measured width, for width animations.    |

## Accessibility

### Keyboard Interactions

| Key     | Description                              |
| ------- | ---------------------------------------- |
| `Space` | Toggles the collapsible panel open/closed. |
| `Enter` | Toggles the collapsible panel open/closed. |
