import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSeparator,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-nested',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        RdxMenuSeparator
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Edit</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Undo
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Redo
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>

                    <!-- Submenu: inner rdxMenuRoot provides submenu context -->
                    <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuSubTrigger
                        >
                            Find
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
                                    Search Web…
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Find…
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Find and Replace…
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Use Selection for Find
                                </button>
                            </div>
                        </div>
                    </ng-container>

                    <!-- Second submenu -->
                    <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                        <button
                            class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                            rdxMenuSubTrigger
                        >
                            Spelling and Grammar
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
                                    Show Spelling and Grammar
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Check Document Now
                                </button>
                                <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    rdxMenuItem
                                >
                                    Check Spelling While Typing
                                </button>
                                <button
                                    class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                                    [disabled]="true"
                                    rdxMenuItem
                                >
                                    Check Grammar
                                </button>
                            </div>
                        </div>
                    </ng-container>

                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Cut
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Copy
                    </button>
                    <button
                        class="demo-menu-item data-[highlighted]:bg-muted data-[highlighted]:outline-border relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline data-[highlighted]:outline-1"
                        rdxMenuItem
                    >
                        Paste
                    </button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuNestedComponent {}
