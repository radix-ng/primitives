# Drawer

An edge-anchored sheet that opens over the page and dismisses with a swipe.

> Index — full source of each example is one click away in `../examples/drawer--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

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

Apply the parts to your own markup. `rdxDrawerPortal` teleports every template root into the target
container. Presence waits for native CSS exits on roots or descendants, including transitions and
keyframes. With no exit effect it unmounts immediately. Drawer inherits Dialog's boolean `data-open`
and `data-closed` attributes; `data-starting-style` identifies the entry frame. No decoy keyframe is
needed for a transitioning popup.

The shared demos use transitions so swipe/snap updates do not restart an entry keyframe. For a
bottom drawer, keep the resting transform tied to the swipe variables and disable transitions
while a gesture is active:

```css
[rdxDrawerBackdrop] {
    opacity: 1;
    transition: opacity 200ms ease;
}
[rdxDrawerBackdrop][data-starting-style],
[rdxDrawerBackdrop][data-closed] {
    opacity: 0;
}
[rdxDrawerPopup] {
    transform: translate3d(var(--drawer-swipe-movement-x, 0), var(--drawer-swipe-movement-y, 0), 0);
    transition: transform 300ms ease;
}
[rdxDrawerPopup][data-starting-style],
[rdxDrawerPopup][data-closed] {
    transform: translateY(100%);
}
[rdxDrawerPopup][data-swiping] {
    transition: none;
}
```

The same popup transition works without a backdrop. If you choose exit keyframes instead, use
`forwards` to retain their final frame until the portal unmounts.

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
