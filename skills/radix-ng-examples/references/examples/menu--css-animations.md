# Menu — CSS animations

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Animate the popup itself so its transition status and the portal observe the same exit. Presence
watches real animations in the portal subtree. Keep the popup displayed during the exit;
a closed-state `display: none` would cancel the animation immediately. The parent Positioner hides
once the transition finishes, including when the portal stays mounted.

The example uses the shared Tailwind demo animation utilities. Consumers can bring equivalent
CSS. Key entry and exit keyframes on `data-open` and `data-closed` so the exit starts on the first
closed render, without waiting for a later transition-status render. Popper positions the outer element, leaving
popup transforms free for animation.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-animated',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Animated</button>
            <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                <div [class]="cn(m.popup, m.popupAnimated)" rdxMenuPopup>
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

```html
<ng-template rdxMenuPortal>
    <div [class]="m.positioner" rdxMenuPositioner>
        <div [class]="cn(m.popup, m.popupAnimated)" rdxMenuPopup>…items…</div>
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
