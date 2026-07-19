# Menu — CSS animations

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

The structural `*rdxMenuPortal` keeps the popup mounted until the closed-state exit keyframes on its
root element (the positioner) finish, so the menu now has real exit animations. `rdxMenuPopup` also
exposes `data-starting-style` on the enter frame and `data-ending-style` while the exit plays, and
`(onOpenChangeComplete)` fires after the animation finishes. Put an opacity exit keyframe on the
positioner (the part presence watches, keyed on `data-open` / `data-closed`) and keep the transform
zoom on the popup. Use Angular `styles` on the component (or global CSS) to define the keyframes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-animated',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [
        `
            @keyframes popup-in {
                from {
                    opacity: 0;
                    transform: scale(0.95) translateY(-4px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            @keyframes popup-out {
                from {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: scale(0.95) translateY(-4px);
                }
            }
            .animated-popup {
                animation: popup-in 150ms ease;
            }
            .animated-popup[data-ending-style] {
                animation: popup-out 150ms ease;
            }
            /*
             * Unlike popover/navigation-menu, the shared menu popup carries 'data-[closed]:hidden' (it
             * is reused by the always-rendered menubar popups), so on close it is 'display: none' and
             * cannot run its own exit animation. The exit therefore lives on the positioner — keyed on
             * its 'data-open'/'data-closed' — which is what the presence machine waits on before
             * unmounting. This is a legitimate carrier, not an ADR-0011 "decoy".
             */
            @keyframes positioner-fade-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            @keyframes positioner-fade-out {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            .animated-positioner[data-open] {
                animation: positioner-fade-in 150ms ease;
            }
            .animated-positioner[data-closed] {
                animation: positioner-fade-out 150ms ease;
            }
        `
    ],
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Animated</button>

            <div *rdxMenuPortal [class]="cn(m.positioner, 'animated-positioner')" sideOffset="4" rdxMenuPositioner>
                <div [class]="cn(m.popup, 'animated-popup')" rdxMenuPopup>
                    <button [class]="m.item" rdxMenuItem>New Tab</button>
                    <button [class]="m.item" rdxMenuItem>New Window</button>
                    <div [class]="m.separator" rdxMenuSeparator></div>
                    <button [class]="m.item" rdxMenuItem>Print…</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuAnimatedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```

#### Animation recipe

```css
@keyframes popup-in {
    from { opacity: 0; transform: scale(0.95) translateY(-4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
@keyframes popup-out {
    from { opacity: 1; transform: scale(1)    translateY(0);    }
    to   { opacity: 0; transform: scale(0.95) translateY(-4px); }
}

/* The positioner is the part `*rdxMenuPortal` watches: its closed-state keyframe is what keeps the
   popup mounted until the exit finishes. Opacity-only, so it never fights the popper's transform. */
@keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}
@keyframes fade-out {
    from { opacity: 1; }
    to   { opacity: 0; }
}
[rdxMenuPositioner][data-open]   { animation: fade-in 150ms ease; }
[rdxMenuPositioner][data-closed] { animation: fade-out 150ms ease; }

/* The popup carries the transform zoom (it is not popper-positioned). */
[rdxMenuPopup] {
    animation: popup-in 150ms ease;
    transform-origin: var(--transform-origin);
}
[rdxMenuPopup][data-ending-style] {
    animation: popup-out 150ms ease;
}
```

The optional backdrop is a sibling root; it carries `data-open` / `data-closed` too:

```css
[rdxMenuBackdrop] {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.3);
}
[rdxMenuBackdrop][data-open]   { animation: fade-in 150ms ease; }
[rdxMenuBackdrop][data-closed] { animation: fade-out 150ms ease; }
```

#### `onOpenChangeComplete`

Bind `(onOpenChangeComplete)` on `rdxMenuRoot` to run logic after the popup has fully appeared or
disappeared:

```html
<ng-container #root="rdxMenuRoot" (onOpenChangeComplete)="onDone($event)" rdxMenuRoot>
```

The event carries `true` when the open animation finishes and `false` when the close animation
finishes.
