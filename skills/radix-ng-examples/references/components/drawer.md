# Drawer

An edge-anchored sheet that opens over the page and dismisses with a swipe.

> Index — full source of each example is one click away in `../examples/drawer--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

## Features

- ✅ Reuses the Dialog primitive: trigger, portal, presence, backdrop, viewport, title, description, close.
- ✅ Modal by default, but `[modal]` (`true | false | 'trap-focus'`) and `disablePointerDismissal` stay user-overridable.
- ✅ Swipe-to-dismiss in any direction via `[swipeDirection]` (`'up' | 'down' | 'left' | 'right'`).
- ✅ Headless gesture contract: `--drawer-swipe-movement-x/y`, `--drawer-swipe-strength`, `[data-swiping]`, `[data-swipe-direction]`, `[data-swipe-dismiss]`.
- ✅ Rubber-band resistance when dragging against the dismiss direction; velocity- or distance-based release.
- ✅ Yields to scrollable regions inside `rdxDrawerContent` until they reach their edge; opt out with `data-base-ui-swipe-ignore`.
- ✅ Swipe-to-open from an off-canvas `rdxDrawerSwipeArea` strip.
- ✅ Snap points (`[snapPoints]`, `[(snapPoint)]`, `[defaultSnapPoint]`, `[snapToSequentialPoints]`) with velocity skipping and `data-expanded`.
- ✅ Nested drawers (detected through the dialog hierarchy): the parent gains `data-nested-drawer-open` / `--nested-drawers`.
- ✅ Virtual keyboard provider for mobile bottom-sheet forms: `visualViewport` inset, focus alignment, scroll slack, tap-to-focus, and nested drawer guards.
- ✅ Optional `rdxDrawerProvider` + `rdxDrawerIndent` / `rdxDrawerIndentBackground` for an app-wide page-scale effect.
- ✅ Exposes swipe progress on the backdrop with `--drawer-swipe-progress` for a gesture-linked fade.
- ✅ Supports two-way `[(open)]`, `defaultOpen`, multiple triggers, controlled `triggerId`, and detached triggers via a shared handle.
- ✅ Closes on Escape, swipe, outside pointer interaction, or an explicit close button, and reports the reason on `onOpenChange`.

## Import

```typescript
import {
    createRdxDrawerHandle,
    provideRdxDrawerProvider,
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerIndent,
    RdxDrawerIndentBackground,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerProviderDirective,
    RdxDrawerRoot,
    RdxDrawerSwipeArea,
    RdxDrawerTitle,
    RdxDrawerTrigger,
    RdxDrawerVirtualKeyboardProvider,
    RdxDrawerViewport
} from '@radix-ng/primitives/drawer';
```

Or import all parts through the module:

```typescript
import { RdxDrawerModule } from '@radix-ng/primitives/drawer';
```

The `drawerImports` array re-exports every part for standalone `imports`.

## Anatomy

Apply the parts to your own markup. `rdxDrawerPortal` is a **structural** directive: it teleports the
backdrop and popup into `document.body` while the drawer is open and waits for the closed-state CSS
exit keyframes on every root element before unmounting. At least one root **must** have a
`data-[state=closed]` `@keyframes` exit animation, otherwise presence sees no animation on the roots
and unmounts the drawer instantly, skipping the slide-out (the popup's slide is a CSS _transition_,
which presence does not wait for). Give the backdrop an overlay fade sized to at least the popup's
slide duration:

```css
[rdxDrawerBackdrop][data-state='open'] {
    animation: overlay-in 250ms ease-out;
}
[rdxDrawerBackdrop][data-state='closed'] {
    animation: overlay-out 200ms ease-in forwards;
}
```

For a non-modal drawer (no backdrop) put the overlay-fade keyframe on the popup instead — it carries
`data-state` too.

The popup's resting transform should read the swipe variables so the gesture and snap-back are visible,
and its slide-out keyframe should hold the closed position with `forwards`:

```css
[rdxDrawerPopup] {
    transform: translate3d(var(--drawer-swipe-movement-x, 0), var(--drawer-swipe-movement-y, 0), 0);
    transition: transform 0.3s ease;
}
[rdxDrawerPopup][data-swiping] {
    transition: none;
}
[rdxDrawerPopup][data-state='closed'] {
    animation: slide-out-bottom 200ms ease-in forwards;
}
```

```html
<div rdxDrawerRoot>
    <button rdxDrawerTrigger>Open</button>

    <ng-template rdxDrawerPortal>
        <div rdxDrawerBackdrop></div>
        <div rdxDrawerViewport>
            <div rdxDrawerPopup>
                <h2 rdxDrawerTitle>Title</h2>
                <p rdxDrawerDescription>Description</p>
                <div rdxDrawerContent>…scrollable body…</div>
                <button rdxDrawerClose>Close</button>
            </div>
        </div>
    </ng-template>
</div>
```

## Examples

- [Default](../examples/drawer--default.md)
- [State](../examples/drawer--state.md)
- [Position](../examples/drawer--position.md)
- [Snap points](../examples/drawer--snap-points.md)
- [Swipe to open](../examples/drawer--swipe-to-open.md)
- [Mobile navigation](../examples/drawer--mobile-navigation.md)
- [Non-modal](../examples/drawer--non-modal.md)
- [Action sheet with separate destructive action](../examples/drawer--action-sheet-with-separate-destructive-action.md)
- [Virtual keyboard](../examples/drawer--virtual-keyboard.md)
- [Nested drawers](../examples/drawer--nested-drawers.md)
- [Indent effect](../examples/drawer--indent-effect.md)
- [Detached triggers](../examples/drawer--detached-triggers.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/drawer.json`
- Styling (parts + `data-*`): `references/styling-contract/drawer.json`
