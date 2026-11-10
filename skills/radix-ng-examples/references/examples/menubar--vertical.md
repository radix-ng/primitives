# Menubar — Vertical

> One example from the [Menubar](../components/menubar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Use `<rdx-menubar-default orientation="vertical" />` to render the demo vertically.
Up/Down move between the closed triggers. The cross-axis arrow opens a menu: Right in LTR, Left in RTL.
Inside the popup, Up/Down navigate its items; Escape returns to the trigger.
The return arrow (Left in LTR, Right in RTL) closes the popup and returns focus to its trigger.

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { RdxMenubarRoot, type RdxMenubarOrientation } from '@radix-ng/primitives/menubar';
import { cn, demoMenu, demoMenubar } from '../../storybook/styles';

@Component({
    selector: 'rdx-menubar-default',
    imports: [RdxMenuModule, RdxMenubarRoot, LucideChevronRight],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            [class]="cn(mb.root, orientation() === 'vertical' && 'w-48 flex-col items-stretch')"
            [orientation]="orientation()"
            rdxMenubarRoot
        >
            <ng-container rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>File</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        [class]="m.positioner"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        sideOffset="4"
                        rdxMenuPositioner
                    >
                        <div [class]="m.popup" rdxMenuPopup>
                            <div [class]="m.item" rdxMenuItem>New</div>
                            <div [class]="m.item" rdxMenuItem>Open</div>
                            <div [class]="m.item" rdxMenuItem>Save</div>
                            <ng-container rdxMenuRoot>
                                <div [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                    Export
                                    <svg class="size-4" lucideChevronRight></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        [class]="m.positioner"
                                        side="inline-end"
                                        align="start"
                                        sideOffset="-4"
                                        alignOffset="-4"
                                        rdxMenuPositioner
                                    >
                                        <div [class]="m.popup" rdxMenuPopup>
                                            <div [class]="m.item" rdxMenuItem>PDF</div>
                                            <div [class]="m.item" rdxMenuItem>PNG</div>
                                            <div [class]="m.item" rdxMenuItem>SVG</div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <div [class]="m.item" rdxMenuItem>Print</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Edit</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        [class]="m.positioner"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        sideOffset="4"
                        rdxMenuPositioner
                    >
                        <div [class]="m.popup" rdxMenuPopup>
                            <div [class]="m.item" rdxMenuItem>Cut</div>
                            <div [class]="m.item" rdxMenuItem>Copy</div>
                            <div [class]="m.item" rdxMenuItem>Paste</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>View</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        [class]="m.positioner"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        sideOffset="4"
                        rdxMenuPositioner
                    >
                        <div [class]="m.popup" rdxMenuPopup>
                            <div [class]="m.item" rdxMenuItem>Zoom In</div>
                            <div [class]="m.item" rdxMenuItem>Zoom Out</div>
                            <ng-container rdxMenuRoot>
                                <div [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                    Layout
                                    <svg class="size-4" lucideChevronRight></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        [class]="m.positioner"
                                        side="inline-end"
                                        align="start"
                                        sideOffset="-4"
                                        alignOffset="-4"
                                        rdxMenuPositioner
                                    >
                                        <div [class]="m.popup" rdxMenuPopup>
                                            <div [class]="m.item" rdxMenuItem>Single Page</div>
                                            <div [class]="m.item" rdxMenuItem>Two Pages</div>
                                            <div [class]="m.item" rdxMenuItem>Continuous</div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <div [class]="m.separator" rdxMenuSeparator></div>
                            <div [class]="m.item" rdxMenuItem>Full Screen</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container [disabled]="true" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Help</button>
            </ng-container>
        </div>
    `
})
export class RdxMenubarDefaultComponent {
    readonly orientation = input<RdxMenubarOrientation>('horizontal');
    readonly keepMounted = input(false);
    protected readonly cn = cn;
    protected readonly mb = demoMenubar;
    protected readonly m = demoMenu;
}
```
