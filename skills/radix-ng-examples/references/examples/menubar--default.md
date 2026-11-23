# Menubar — Default

> One example from the [Menubar](../components/menubar.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The Base UI example structure: File with Export, Edit, View with Layout, and disabled Help.
The demo keeps the shared `demoMenubar` and `demoMenu` styles.
Click a trigger to open it, then hover the other triggers to switch, or use the arrow keys.

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger,
    type RdxMenuOrientation
} from '@radix-ng/primitives/menu';
import { RdxMenubarRoot, type RdxMenubarOrientation } from '@radix-ng/primitives/menubar';

@Component({
    selector: 'rdx-menubar-default',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator,
        RdxMenubarRoot,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            class="text-foreground inline-flex items-center"
            [class]="orientation() === 'vertical' ? 'w-48 flex-col items-stretch' : ''"
            [orientation]="orientation()"
            rdxMenubarRoot
        >
            <ng-container [orientation]="menuOrientation()" rdxMenuRoot>
                <button
                    class="demo-button demo-button-ghost data-popup-open:bg-muted focus-visible:bg-muted h-8 shrink-0 px-3"
                    rdxMenuTrigger
                >
                    File
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
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
                                        class="size-4 shrink-0"
                                        [class]="menuOrientation() === 'horizontal' ? 'rotate-90' : 'rtl:rotate-180'"
                                        lucideChevronRight
                                    ></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        [side]="menuOrientation() === 'horizontal' ? 'bottom' : 'inline-end'"
                                        [alignOffset]="menuOrientation() === 'horizontal' ? 0 : -4"
                                        sideOffset="8"
                                        align="start"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-popup demo-popup-motion min-w-40! min-w-[8rem] py-1 outline-none data-closed:pointer-events-none"
                                            rdxMenuPopup
                                        >
                                            <div
                                                class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                                rdxMenuItem
                                            >
                                                PDF
                                            </div>
                                            <div
                                                class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                                rdxMenuItem
                                            >
                                                PNG
                                            </div>
                                            <div
                                                class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                                rdxMenuItem
                                            >
                                                SVG
                                            </div>
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
                <button
                    class="demo-button demo-button-ghost data-popup-open:bg-muted focus-visible:bg-muted h-8 shrink-0 px-3"
                    rdxMenuTrigger
                >
                    Edit
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
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
                <button
                    class="demo-button demo-button-ghost data-popup-open:bg-muted focus-visible:bg-muted h-8 shrink-0 px-3"
                    rdxMenuTrigger
                >
                    View
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                    <div
                        class="z-50 data-[closed]:pointer-events-none"
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
                                        class="size-4 shrink-0"
                                        [class]="menuOrientation() === 'horizontal' ? 'rotate-90' : 'rtl:rotate-180'"
                                        lucideChevronRight
                                    ></svg>
                                </div>
                                <ng-template [keepMounted]="keepMounted()" rdxMenuPortal>
                                    <div
                                        class="z-50 data-[closed]:pointer-events-none"
                                        [side]="menuOrientation() === 'horizontal' ? 'bottom' : 'inline-end'"
                                        [alignOffset]="menuOrientation() === 'horizontal' ? 0 : -4"
                                        sideOffset="8"
                                        align="start"
                                        rdxMenuPositioner
                                    >
                                        <div
                                            class="demo-popup demo-popup-motion min-w-40! min-w-[8rem] py-1 outline-none data-closed:pointer-events-none"
                                            rdxMenuPopup
                                        >
                                            <div
                                                class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                                rdxMenuItem
                                            >
                                                Single Page
                                            </div>
                                            <div
                                                class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                                rdxMenuItem
                                            >
                                                Two Pages
                                            </div>
                                            <div
                                                class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                                rdxMenuItem
                                            >
                                                Continuous
                                            </div>
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
                <button
                    class="demo-button demo-button-ghost data-popup-open:bg-muted focus-visible:bg-muted h-8 shrink-0 px-3"
                    rdxMenuTrigger
                >
                    Help
                </button>
            </ng-container>
        </div>
    `
})
export class RdxMenubarDefaultComponent {
    readonly orientation = input<RdxMenubarOrientation>('horizontal');
    readonly keepMounted = input(false);
    readonly menuOrientation = input<RdxMenuOrientation>('vertical');
    protected readonly popupClass = computed(() =>
        [
            'demo-menu-popup min-w-[8rem] p-1 data-[closed]:hidden data-[closed]:pointer-events-none',
            this.menuOrientation() === 'horizontal' ? 'flex gap-1' : 'min-w-44!'
        ]
            .filter(Boolean)
            .join(' ')
    );
    protected readonly itemClass = computed(() =>
        [
            'demo-menu-item relative flex w-full items-center gap-2 px-2 py-1.5 data-highlighted:bg-primary data-highlighted:text-primary-foreground data-[disabled]:opacity-50',
            this.menuOrientation() === 'horizontal' && 'w-auto! whitespace-nowrap'
        ]
            .filter(Boolean)
            .join(' ')
    );
    protected readonly subTriggerClass = computed(() =>
        [this.itemClass(), 'justify-between gap-6! data-[popup-open]:bg-muted'].filter(Boolean).join(' ')
    );
    protected readonly separatorClass = computed(() =>
        this.menuOrientation() === 'horizontal' ? 'bg-border mx-1 w-px self-stretch' : '-mx-1 my-1 h-px bg-border'
    );
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
