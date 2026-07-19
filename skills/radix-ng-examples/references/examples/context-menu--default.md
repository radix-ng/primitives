# Context Menu — Default

> One example from the [Context Menu](../components/context-menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

A right-click area with shortcuts, a disabled item, a submenu, checkbox items, and a radio group.
Right-click the dashed area to open the menu at the pointer.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDot } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideCheck, LucideDot],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                [class]="
                    cn(
                        'border-border text-muted-foreground flex h-[150px] w-[300px] items-center justify-center rounded-md border-2 border-dashed text-sm select-none',
                        'data-[popup-open]:bg-muted data-[popup-open]:border-solid'
                    )
                "
                rdxContextMenuTrigger
            >
                Right click here
            </div>

            <div *rdxMenuPortal [class]="m.positioner" rdxMenuPositioner>
                <div [class]="m.popup" rdxMenuPopup>
                    <button [class]="m.item" rdxMenuItem>
                        Back
                        <span [class]="shortcut">⌘ [</span>
                    </button>
                    <button [class]="m.item" [disabled]="true" rdxMenuItem>
                        Forward
                        <span [class]="shortcut">⌘ ]</span>
                    </button>
                    <button [class]="m.item" rdxMenuItem>
                        Reload
                        <span [class]="shortcut">⌘ R</span>
                    </button>

                    <!-- More Tools submenu -->
                    <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                        <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                            More Tools
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>
                        <div
                            *rdxMenuPortal
                            [class]="m.positioner"
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                        >
                            <div [class]="m.popup" rdxMenuPopup>
                                <button [class]="m.item" rdxMenuItem>Save Page As…</button>
                                <button [class]="m.item" rdxMenuItem>Create Shortcut…</button>
                                <button [class]="m.item" rdxMenuItem>Name Window…</button>
                            </div>
                        </div>
                    </ng-container>

                    <div [class]="m.separator" rdxMenuSeparator></div>

                    <label [(checked)]="showBookmarks" [class]="m.selectableItem" rdxMenuCheckboxItem>
                        <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Bookmarks
                        <span [class]="shortcut">⌘ B</span>
                    </label>
                    <label [(checked)]="showFullUrls" [class]="m.selectableItem" rdxMenuCheckboxItem>
                        <span [class]="m.itemIndicator" rdxMenuCheckboxItemIndicator>
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Full URLs
                    </label>

                    <div [class]="m.separator" rdxMenuSeparator></div>

                    <div [(value)]="person" rdxMenuRadioGroup>
                        <div [class]="m.groupLabel" rdxMenuGroupLabel>People</div>
                        <label [class]="m.selectableItem" value="pedro" rdxMenuRadioItem>
                            <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                <svg [size]="10" strokeWidth="5" lucideDot></svg>
                            </span>
                            Pedro Duarte
                        </label>
                        <label [class]="m.selectableItem" value="colm" rdxMenuRadioItem>
                            <span [class]="m.itemIndicator" rdxMenuRadioItemIndicator>
                                <svg [size]="10" strokeWidth="5" lucideDot></svg>
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
```
