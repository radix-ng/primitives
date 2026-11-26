# Menu — CSS animations

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Animate the popup itself so its transition status and the portal share the same render lifetime.
Popup and Backdrop register their animation elements automatically; add `rdxPresenceTarget` for
another animated element inside the portal. Keep the popup displayed during the exit;
a closed-state `display: none` would cancel the animation immediately. The parent Positioner hides
once the transition finishes, including when the portal stays mounted.

The example uses the shared Tailwind demo animation utilities. Consumers can bring equivalent
CSS. Key entry and exit keyframes on `data-open` and `data-closed` so the exit starts on the first
closed render, without waiting for a later transition-status render. Popper positions the outer element, leaving
popup transforms free for animation.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-animated',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Animated</button>
            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block! data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        New Tab
                    </button>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        New Window
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                        rdxMenuItem
                    >
                        Print…
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuAnimatedComponent {}
```

```html
<ng-template rdxMenuPortal>
    <div class="z-50 data-[closed]:pointer-events-none" sideOffset="4" rdxMenuPositioner>
        <div
            class="demo-menu-popup data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out min-w-[8rem] origin-[var(--transform-origin)] p-1 data-[closed]:pointer-events-none data-[closed]:block!"
            rdxMenuPopup
        >
            …items…
        </div>
    </div>
</ng-template>
```

#### `onOpenChangeComplete`

Bind `(onOpenChangeComplete)` on `rdxMenuRoot` to run logic after the popup has fully appeared or
disappeared:

```html
<ng-container #root="rdxMenuRoot" (onOpenChangeComplete)="onDone($event)" rdxMenuRoot>
```

The event carries `true` when the open animation finishes and `false` when the accepted close has
finished: after the portal view exits, or after CSS completes for a retained portal. Each accepted
close completes once. Reopening during an exit cancels the old close completion.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
