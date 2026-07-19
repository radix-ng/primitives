# Menu — Default

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

A basic dropdown with regular items, a disabled item, and a separator.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-default',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>File</button>

            <div *rdxMenuPortal [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
                <div [class]="m.popup" rdxMenuPopup>
                    <button [class]="m.item" rdxMenuItem>New Tab</button>
                    <button [class]="m.item" rdxMenuItem>New Window</button>
                    <button [class]="m.item" [disabled]="true" rdxMenuItem>New Private Window</button>
                    <div [class]="m.separator" rdxMenuSeparator></div>
                    <button [class]="m.item" rdxMenuItem>Save Page As…</button>
                    <button [class]="m.item" rdxMenuItem>Print…</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuDefaultComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```
