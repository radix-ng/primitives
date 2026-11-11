# Menubar — Horizontal popup

> One example from the [Menubar](../components/menubar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

The bar's `orientation` and each Menu Root's `orientation` are independent.
Use `<rdx-menubar-default menuOrientation="horizontal" />` for horizontal popup items, with
vertical submenus. Left/Right navigate the root popup in text direction. Down on Export opens its
submenu; returning with Left (LTR) or Right (RTL) can also navigate the containing lists.
Up returns a horizontal popup to its trigger. Each ancestor applies its own navigation axis.
The example keeps the same Portal → Positioner → Popup structure and shared demo styles.

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { RdxMenuModule, type RdxMenuOrientation } from '@radix-ng/primitives/menu';
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
            <ng-container [orientation]="menuOrientation()" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>File</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        [class]="m.positioner"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        alignOffset="-4"
                        sideOffset="8"
                        rdxMenuPositioner
                    >
                        <div [class]="popupClass()" rdxMenuPopup>
                            <div [class]="itemClass()" rdxMenuItem>New</div>
                            <div [class]="itemClass()" rdxMenuItem>Open</div>
                            <div [class]="itemClass()" rdxMenuItem>Save</div>
                            <ng-container rdxMenuRoot>
                                <div [class]="subTriggerClass()" rdxMenuSubTrigger>
                                    Export
                                    <svg
                                        [class]="
                                            cn(
                                                'size-4 shrink-0',
                                                menuOrientation() === 'horizontal' ? 'rotate-90' : 'rtl:rotate-180'
                                            )
                                        "
                                        lucideChevronRight
                                    ></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        [class]="m.positioner"
                                        [side]="menuOrientation() === 'horizontal' ? 'bottom' : 'inline-end'"
                                        [alignOffset]="menuOrientation() === 'horizontal' ? 0 : -4"
                                        sideOffset="8"
                                        align="start"
                                        rdxMenuPositioner
                                    >
                                        <div [class]="submenuClass" rdxMenuPopup>
                                            <div [class]="m.item" rdxMenuItem>PDF</div>
                                            <div [class]="m.item" rdxMenuItem>PNG</div>
                                            <div [class]="m.item" rdxMenuItem>SVG</div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <div
                                [class]="separatorClass()"
                                [orientation]="menuOrientation() === 'horizontal' ? 'vertical' : 'horizontal'"
                                rdxMenuSeparator
                            ></div>
                            <div [class]="itemClass()" rdxMenuItem>Print</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container [orientation]="menuOrientation()" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Edit</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        [class]="m.positioner"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        alignOffset="-4"
                        sideOffset="8"
                        rdxMenuPositioner
                    >
                        <div [class]="popupClass()" rdxMenuPopup>
                            <div [class]="itemClass()" rdxMenuItem>Cut</div>
                            <div [class]="itemClass()" rdxMenuItem>Copy</div>
                            <div [class]="itemClass()" rdxMenuItem>Paste</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container [orientation]="menuOrientation()" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>View</button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        [class]="m.positioner"
                        [side]="orientation() === 'vertical' ? 'inline-end' : 'bottom'"
                        align="start"
                        alignOffset="-4"
                        sideOffset="8"
                        rdxMenuPositioner
                    >
                        <div [class]="popupClass()" rdxMenuPopup>
                            <div [class]="itemClass()" rdxMenuItem>Zoom In</div>
                            <div [class]="itemClass()" rdxMenuItem>Zoom Out</div>
                            <ng-container rdxMenuRoot>
                                <div [class]="subTriggerClass()" rdxMenuSubTrigger>
                                    Layout
                                    <svg
                                        [class]="
                                            cn(
                                                'size-4 shrink-0',
                                                menuOrientation() === 'horizontal' ? 'rotate-90' : 'rtl:rotate-180'
                                            )
                                        "
                                        lucideChevronRight
                                    ></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        [class]="m.positioner"
                                        [side]="menuOrientation() === 'horizontal' ? 'bottom' : 'inline-end'"
                                        [alignOffset]="menuOrientation() === 'horizontal' ? 0 : -4"
                                        sideOffset="8"
                                        align="start"
                                        rdxMenuPositioner
                                    >
                                        <div [class]="submenuClass" rdxMenuPopup>
                                            <div [class]="m.item" rdxMenuItem>Single Page</div>
                                            <div [class]="m.item" rdxMenuItem>Two Pages</div>
                                            <div [class]="m.item" rdxMenuItem>Continuous</div>
                                        </div>
                                    </div>
                                </ng-template>
                            </ng-container>
                            <div
                                [class]="separatorClass()"
                                [orientation]="menuOrientation() === 'horizontal' ? 'vertical' : 'horizontal'"
                                rdxMenuSeparator
                            ></div>
                            <div [class]="itemClass()" rdxMenuItem>Full Screen</div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>

            <ng-container [disabled]="true" [orientation]="menuOrientation()" rdxMenuRoot>
                <button [class]="mb.trigger" rdxMenuTrigger>Help</button>
            </ng-container>
        </div>
    `
})
export class RdxMenubarDefaultComponent {
    readonly orientation = input<RdxMenubarOrientation>('horizontal');
    readonly keepMounted = input(false);
    readonly menuOrientation = input<RdxMenuOrientation>('vertical');
    protected readonly popupClass = computed(() =>
        cn(demoMenu.popup, this.menuOrientation() === 'horizontal' ? 'flex gap-1' : 'min-w-44!')
    );
    protected readonly itemClass = computed(() =>
        cn(demoMenu.item, this.menuOrientation() === 'horizontal' && 'w-auto! whitespace-nowrap')
    );
    protected readonly subTriggerClass = computed(() =>
        cn(this.itemClass(), 'justify-between gap-6! data-[popup-open]:bg-muted')
    );
    protected readonly submenuClass = cn(demoMenu.popup, 'min-w-40!');
    protected readonly separatorClass = computed(() =>
        this.menuOrientation() === 'horizontal' ? 'bg-border mx-1 w-px self-stretch' : demoMenu.separator
    );
    protected readonly cn = cn;
    protected readonly mb = demoMenubar;
    protected readonly m = demoMenu;
}
```
