# Menu — Arrow

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Add `rdxMenuArrow` inside the popup to render a visual pointer connecting the popup to its trigger.
The arrow SVG fills with `currentColor`, so match the popup surface with a `text-*` token (e.g.
`text-popover`) rather than a `fill-*` class. A directional `drop-shadow` in the border color lets
the popup border flow into the arrow as one continuous outline.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-arrow',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>With Arrow</button>

            <div *rdxMenuPortal [class]="m.positioner" sideOffset="8" rdxMenuPositioner>
                <div [class]="cn(m.popup, 'relative')" rdxMenuPopup>
                    <span [class]="m.arrow" rdxMenuArrow></span>
                    <button [class]="m.item" rdxMenuItem>New Tab</button>
                    <button [class]="m.item" rdxMenuItem>New Window</button>
                    <div [class]="m.separator" rdxMenuSeparator></div>
                    <button [class]="m.item" rdxMenuItem>Print…</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuArrowExampleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```
