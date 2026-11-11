import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { RdxContextMenuModule } from '@radix-ng/primitives/context-menu';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [RdxContextMenuModule, RdxMenuModule, LucideCheck],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div [class]="cn(m.contextArea, 'h-[150px] w-[300px] max-w-full')" tabindex="0" rdxContextMenuTrigger>
                Right click here
            </div>

            <div *rdxMenuPortal [class]="m.positioner" rdxMenuPositioner>
                <div [class]="cn(m.popup, 'min-w-56!')" rdxMenuPopup>
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

                    <button [(checked)]="showBookmarks" [class]="m.selectableItem" type="button" rdxMenuCheckboxItem>
                        <span [class]="m.itemIndicator" aria-hidden="true" rdxMenuCheckboxItemIndicator>
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Bookmarks
                        <span [class]="shortcut">⌘ B</span>
                    </button>
                    <button [(checked)]="showFullUrls" [class]="m.selectableItem" type="button" rdxMenuCheckboxItem>
                        <span [class]="m.itemIndicator" aria-hidden="true" rdxMenuCheckboxItemIndicator>
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Full URLs
                    </button>

                    <div [class]="m.separator" rdxMenuSeparator></div>

                    <div [(value)]="person" rdxMenuRadioGroup>
                        <div [class]="cn(m.groupLabel, 'ps-8')" rdxMenuGroupLabel>People</div>
                        <button [class]="m.selectableItem" type="button" value="pedro" rdxMenuRadioItem>
                            <span [class]="m.itemIndicator" aria-hidden="true" rdxMenuRadioItemIndicator>
                                <span [class]="m.radioIndicator"></span>
                            </span>
                            Pedro Duarte
                        </button>
                        <button [class]="m.selectableItem" type="button" value="colm" rdxMenuRadioItem>
                            <span [class]="m.itemIndicator" aria-hidden="true" rdxMenuRadioItemIndicator>
                                <span [class]="m.radioIndicator"></span>
                            </span>
                            Colm Tuite
                        </button>
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
