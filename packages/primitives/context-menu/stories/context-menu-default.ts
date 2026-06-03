import { cn, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                rdxContextMenuTrigger
                [class]="
                    cn(
                        'border-border text-muted-foreground flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed text-sm select-none',
                        'data-[popup-open]:bg-muted data-[popup-open]:border-solid'
                    )
                "
            >
                Right click here
            </div>

            <div *rdxMenuPortal rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">
                        Back
                        <span [class]="shortcut">⌘ [</span>
                    </button>
                    <button rdxMenuItem [class]="m.item" [disabled]="true">
                        Forward
                        <span [class]="shortcut">⌘ ]</span>
                    </button>
                    <button rdxMenuItem [class]="m.item">
                        Reload
                        <span [class]="shortcut">⌘ R</span>
                    </button>

                    <!-- More Tools submenu -->
                    <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                            More Tools
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>
                        <div
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                            [class]="m.positioner"
                        >
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item">Save Page As…</button>
                                <button rdxMenuItem [class]="m.item">Create Shortcut…</button>
                                <button rdxMenuItem [class]="m.item">Name Window…</button>
                            </div>
                        </div>
                    </ng-container>

                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showBookmarks">
                        <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                            <svg lucideCheck [size]="12"></svg>
                        </span>
                        Show Bookmarks
                        <span [class]="shortcut">⌘ B</span>
                    </label>
                    <label rdxMenuCheckboxItem [class]="m.selectableItem" [(checked)]="showFullUrls">
                        <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">
                            <svg lucideCheck [size]="12"></svg>
                        </span>
                        Show Full URLs
                    </label>

                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <div rdxMenuRadioGroup [(value)]="person">
                        <div rdxMenuGroupLabel [class]="m.groupLabel">People</div>
                        <label value="pedro" rdxMenuRadioItem [class]="m.selectableItem">
                            <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                <svg strokeWidth="5" lucideDot [size]="10"></svg>
                            </span>
                            Pedro Duarte
                        </label>
                        <label value="colm" rdxMenuRadioItem [class]="m.selectableItem">
                            <span rdxMenuRadioItemIndicator [class]="m.itemIndicator">
                                <svg strokeWidth="5" lucideDot [size]="10"></svg>
                            </span>
                            Colm Tuite
                        </label>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxContextMenuDefaultComponent {
    protected readonly cn = cn;
    protected readonly m = demoMenu;
    protected readonly shortcut = 'ml-auto pl-4 text-xs text-muted-foreground';

    showBookmarks = signal(true);
    showFullUrls = signal(false);
    person = signal<string | undefined>('pedro');
}
