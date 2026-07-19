# Menu — Backdrop

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Add `rdxMenuBackdrop` as a sibling root before the positioner inside an explicit
`<ng-template rdxMenuPortal>` to render an overlay behind the popup. Menus are modal by default,
blocking outside pointer events and page scrolling; set `[modal]="false"` to opt out.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-backdrop',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" [modal]="true" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>With Backdrop</button>

            <ng-template rdxMenuPortal>
                <div class="bg-foreground/10 fixed inset-0" rdxMenuBackdrop></div>
                <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                    <div [class]="m.popup" rdxMenuPopup>
                        <button [class]="m.item" rdxMenuItem>New Tab</button>
                        <button [class]="m.item" rdxMenuItem>New Window</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" [disabled]="true" rdxMenuItem>New Private Window</button>
                        <div [class]="m.separator" rdxMenuSeparator></div>
                        <button [class]="m.item" rdxMenuItem>Print…</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
export class RdxMenuBackdropExampleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```
