# Dismissable Layer

#### Detects interactions outside a layer and provides the low-level behavior used by dialogs, popovers, and menus.

```html
<dismissable-layer
    [preventEscapeKeyDownEvent]="preventEscapeKeyDownEvent"
    [preventPointerDownOutsideEvent]="preventPointerDownOutsideEvent"
    [preventFocusOutsideEvent]="preventFocusOutsideEvent"
/>
```

## Features

- Emits events for Escape, pointer interactions outside, focus outside, and combined outside interactions.
- Dismisses the topmost active layer when an event is not prevented.
- Supports nested layers and closes them one at a time.
- Can disable pointer events outside the active layer.
- Supports detached branches that remain interactive without dismissing the layer.

## Anatomy

```html
<div (dismiss)="close()" rdxDismissableLayer>
  Layer content
</div>
```

Prevent an individual dismiss reason by calling `preventDefault()` on the corresponding event:

```html
<div
  (escapeKeyDown)="$event.preventDefault()"
  (pointerDownOutside)="$event.preventDefault()"
  (focusOutside)="$event.preventDefault()"
  rdxDismissableLayer
>
  Layer content
</div>
```

## Examples

### Nested Layers

Only the topmost layer responds to Escape. Open several children and close them one by one.

```html
<section class="flex w-2xl flex-col gap-4">
    <div>
        <h3 class="text-base font-semibold">Nested layers</h3>
        <p class="text-muted-foreground mt-1 text-sm leading-6">
            Open several children, then press Escape. Layers close one at a time, starting with the topmost
            layer.
        </p>
    </div>
    <dismissable-nested />
</section>
```

### Branch

Use `rdxDismissableLayerBranch` for detached controls that should behave as part of the layer even though they are
outside its DOM subtree.

```html
<dismissable-branch />
```

### Focus Trap

Combine a dismissable layer with Focus Scope when keyboard focus must stay inside the active surface.

```html
<dismissable-focus-trap />
```

### Dialog

Dialogs commonly combine a portal, focus guards, Focus Scope, a backdrop, and a dismissable layer.

```html
<section class="flex max-w-xl flex-col gap-4">
    <div class="border-border bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
        <h3 class="text-foreground mb-2 text-sm font-semibold">Dialog behavior</h3>
        <ul class="text-muted-foreground ml-4 list-disc space-y-1 text-sm leading-5">
            <li>Focus moves inside the dialog when mounted.</li>
            <li>Focus is trapped inside the dialog.</li>
            <li>Scrolling and outside interaction are disabled.</li>
            <li>Escape or an outside interaction dismisses the dialog.</li>
            <li>Focus returns to the open button after dismiss.</li>
        </ul>
    </div>
    <dummy-dialog />
</section>
```

### Popover

Popovers combine positioning with optional focus trapping and optional outside pointer event blocking.

```html
<section class="flex max-w-xl flex-col gap-4">
    <div class="border-border bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
        <h3 class="text-foreground mb-2 text-sm font-semibold">Popover behavior</h3>
        <ul class="text-muted-foreground ml-4 list-disc space-y-1 text-sm leading-5">
            <li>Focus moves inside the popover when mounted.</li>
            <li>The controls can enable focus trapping and block outside pointer events.</li>
            <li>Escape or an outside interaction dismisses the popover.</li>
            <li>Focus returns to the open button after dismiss.</li>
        </ul>
    </div>
    <dummy-popover [disableOutsidePointerEvents]="disableOutsidePointerEvents" [trapped]="trapped" />
</section>
```

## API Reference

### Layer
