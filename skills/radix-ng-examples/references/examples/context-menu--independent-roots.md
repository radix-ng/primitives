# Context Menu — Independent Roots

> One example from the [Context Menu](../components/context-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Nest another `rdxContextMenuRoot` when an area owns a separate menu and selection lifecycle.
The inner Root has its own disabled state and cancellation policy. Selecting an image action closes
the image menu; the workspace menu stays open. Escape closes the deepest popup first. Use
`rdxMenuRoot` with `rdxMenuSubTrigger` for an ordinary submenu that shares its parent's command chain.

Both portals below use `keepMounted`. A retained inner popup remains interactive after reopening.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-independent',
    imports: [RdxContextMenuModule, RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid max-w-full gap-4">
            <ng-container rdxContextMenuRoot>
                <div [class]="cn(m.contextArea, 'min-h-36 min-w-64')" tabindex="0" rdxContextMenuTrigger>
                    Right-click the workspace
                </div>
                <ng-template [keepMounted]="true" rdxMenuPortal>
                    <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="cn(m.popup, 'min-w-56!')" aria-label="Workspace actions" rdxMenuPopup>
                            <div [class]="m.item" (onSelect)="selected.set('New file')" rdxMenuItem>New file</div>
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <ng-container rdxContextMenuRoot>
                                <div
                                    [class]="cn(m.contextArea, 'm-1 min-h-24 flex-col gap-1 p-4 text-center')"
                                    tabindex="0"
                                    rdxContextMenuTrigger
                                >
                                    Image preview
                                    <span class="text-muted-foreground text-xs">Right-click for image actions</span>
                                </div>
                                <ng-template [keepMounted]="true" rdxMenuPortal>
                                    <div
                                        [class]="m.positioner"
                                        side="right"
                                        align="start"
                                        sideOffset="4"
                                        rdxMenuPositioner
                                    >
                                        <div [class]="cn(m.popup, 'min-w-44!')" aria-label="Image actions" rdxMenuPopup>
                                            <div [class]="m.item" (onSelect)="selected.set('Copy image')" rdxMenuItem>
                                                Copy image
                                            </div>
                                            <div [class]="m.item" (onSelect)="selected.set('Save image')" rdxMenuItem>
                                                Save image
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground max-w-72 text-sm">
                Image actions use an independent Root. Escape closes one menu at a time.
            </p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxContextMenuIndependentComponent {
    protected readonly selected = signal('none');
    protected readonly cn = cn;
    protected readonly m = demoMenu;
}
```
