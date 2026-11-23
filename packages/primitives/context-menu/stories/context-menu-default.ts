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
                class="border-foreground bg-background text-foreground data-popup-open:bg-muted flex aspect-5/3 w-64 max-w-full items-center justify-center border text-sm select-none"
                tabindex="0"
                rdxContextMenuTrigger
            >
                Right click here
            </div>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal rdxMenuPositioner>
                <div
                    class="demo-popup demo-popup-motion min-w-56! min-w-[8rem] py-1 outline-none data-closed:pointer-events-none"
                    rdxMenuPopup
                >
                    <button class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start" rdxMenuItem>
                        Back
                        <span class="ms-auto ps-4 text-xs opacity-70">⌘ [</span>
                    </button>
                    <button
                        class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                        [disabled]="true"
                        rdxMenuItem
                    >
                        Forward
                        <span class="ms-auto ps-4 text-xs opacity-70">⌘ ]</span>
                    </button>
                    <button class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start" rdxMenuItem>
                        Reload
                        <span class="ms-auto ps-4 text-xs opacity-70">⌘ R</span>
                    </button>

                    <!-- More Tools submenu -->
                    <ng-container #moreSub="rdxMenuRoot" rdxMenuRoot>
                        <button
                            class="demo-menu-option flex w-full items-center justify-between gap-2 px-4 py-2 text-start"
                            rdxMenuSubTrigger
                        >
                            More Tools
                            <span class="text-xs opacity-70">›</span>
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
                                class="demo-popup demo-popup-motion min-w-[8rem] py-1 outline-none data-closed:pointer-events-none"
                                rdxMenuPopup
                            >
                                <button
                                    class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                    rdxMenuItem
                                >
                                    Save Page As…
                                </button>
                                <button
                                    class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                    rdxMenuItem
                                >
                                    Create Shortcut…
                                </button>
                                <button
                                    class="demo-menu-option flex w-full items-center gap-2 px-4 py-2 text-start"
                                    rdxMenuItem
                                >
                                    Name Window…
                                </button>
                            </div>
                        </div>
                    </ng-container>

                    <div class="bg-foreground mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <button
                        class="demo-menu-option flex w-full items-center py-2 ps-8 pe-4 text-start"
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
                        <span class="ms-auto ps-4 text-xs opacity-70">⌘ B</span>
                    </button>
                    <button
                        class="demo-menu-option flex w-full items-center py-2 ps-8 pe-4 text-start"
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

                    <div class="bg-foreground mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <div [(value)]="person" rdxMenuRadioGroup>
                        <div class="demo-menu-group-label px-2 py-1.5 ps-8" rdxMenuGroupLabel>People</div>
                        <button
                            class="demo-menu-option flex w-full items-center py-2 ps-8 pe-4 text-start"
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
                            class="demo-menu-option flex w-full items-center py-2 ps-8 pe-4 text-start"
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
