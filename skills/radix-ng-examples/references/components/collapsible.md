# Collapsible

#### A panel that expands and collapses, revealing or hiding its contents.

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

`RdxCollapsibleRootDirective`

### Trigger

`RdxCollapsibleTriggerDirective`

A button that toggles the panel. Reads everything from the root context; it exposes
`aria-expanded`, `aria-controls` while open, and `data-panel-open` while open. Disabled triggers
remain focusable and expose `aria-disabled`.

### Panel

`RdxCollapsiblePanelDirective`

## Accessibility

### Keyboard Interactions

| Key     | Description                              |
| ------- | ---------------------------------------- |
| `Space` | Toggles the collapsible panel open/closed. |
| `Enter` | Toggles the collapsible panel open/closed. |
