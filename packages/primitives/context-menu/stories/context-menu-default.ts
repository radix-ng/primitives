import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { RdxContextMenuRoot, RdxContextMenuTrigger } from '@radix-ng/primitives/context-menu';
import {
    RdxMenuCheckboxItem,
    RdxMenuCheckboxItemIndicator,
    RdxMenuGroupLabel,
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRadioGroup,
    RdxMenuRadioItem,
    RdxMenuRadioItemIndicator,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-context-menu-default',
    imports: [
        RdxContextMenuRoot,
        RdxContextMenuTrigger,
        RdxMenuRoot,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuGroupLabel,
        RdxMenuSeparator,
        RdxMenuCheckboxItem,
        RdxMenuCheckboxItemIndicator,
        RdxMenuRadioGroup,
        RdxMenuRadioItem,
        RdxMenuRadioItemIndicator,
        LucideCheck
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxContextMenuRoot" rdxContextMenuRoot>
            <div
                class="demo-menu-context-area data-[popup-open]:bg-muted flex h-[150px] w-[300px] max-w-full items-center justify-center p-4 data-[popup-open]:border-solid"
                tabindex="0"
                rdxContextMenuTrigger
            >
                Right click here
            </div>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-56! min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Back
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ [</span>
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        [disabled]="true"
                        rdxMenuItem
                    >
                        Forward
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ ]</span>
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Reload
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ R</span>
                    </button>

                    <!-- More Tools submenu -->
                    <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuSubTrigger
                        >
                            More Tools
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>
                        <div
                            class="z-50 data-[closed]:pointer-events-none"
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                        >
                            <div
                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                rdxMenuPopup
                            >
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Save Page As…
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Create Shortcut…
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Name Window…
                                </button>
                            </div>
                        </div>
                    </ng-container>

                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <button
                        class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        [(checked)]="showBookmarks"
                        type="button"
                        rdxMenuCheckboxItem
                    >
                        <span
                            class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                            aria-hidden="true"
                            rdxMenuCheckboxItemIndicator
                        >
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Bookmarks
                        <span class="text-muted-foreground ml-auto pl-4 text-xs">⌘ B</span>
                    </button>
                    <button
                        class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        [(checked)]="showFullUrls"
                        type="button"
                        rdxMenuCheckboxItem
                    >
                        <span
                            class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                            aria-hidden="true"
                            rdxMenuCheckboxItemIndicator
                        >
                            <svg [size]="12" lucideCheck></svg>
                        </span>
                        Show Full URLs
                    </button>

                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <div [(value)]="person" rdxMenuRadioGroup>
                        <div class="demo-menu-group-label px-2 py-1.5 ps-8" rdxMenuGroupLabel>People</div>
                        <button
                            class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            type="button"
                            value="pedro"
                            rdxMenuRadioItem
                        >
                            <span
                                class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                aria-hidden="true"
                                rdxMenuRadioItemIndicator
                            >
                                <span class="size-2 shrink-0 rounded-full bg-current"></span>
                            </span>
                            Pedro Duarte
                        </button>
                        <button
                            class="demo-menu-selectable-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            type="button"
                            value="colm"
                            rdxMenuRadioItem
                        >
                            <span
                                class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                aria-hidden="true"
                                rdxMenuRadioItemIndicator
                            >
                                <span class="size-2 shrink-0 rounded-full bg-current"></span>
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
    showBookmarks = signal(true);
    showFullUrls = signal(false);
    person = signal<string | undefined>('pedro');
}
