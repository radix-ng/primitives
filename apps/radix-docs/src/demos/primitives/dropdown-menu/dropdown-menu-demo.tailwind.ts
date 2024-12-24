import { Component } from '@angular/core';

import {
    DropdownSide,
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemCheckboxDirective,
    RdxDropdownMenuItemDirective,
    RdxDropdownMenuItemIndicatorDirective,
    RdxDropdownMenuItemRadioDirective,
    RdxDropdownMenuItemRadioGroupDirective,
    RdxDropdownMenuSeparatorDirective,
    RdxDropdownMenuTriggerDirective
} from '@radix-ng/primitives/dropdown-menu';
import { Check, Dot, LucideAngularModule, Menu } from 'lucide-angular';

@Component({
    selector: 'dropdown-menu-tailwind-demo',
    standalone: true,
    imports: [
        RdxDropdownMenuTriggerDirective,
        RdxDropdownMenuItemDirective,
        RdxDropdownMenuItemCheckboxDirective,
        RdxDropdownMenuItemIndicatorDirective,
        RdxDropdownMenuSeparatorDirective,
        RdxDropdownMenuContentDirective,
        LucideAngularModule,
        RdxDropdownMenuItemRadioGroupDirective,
        RdxDropdownMenuItemRadioDirective
    ],
    template: `
        <button
            class="IconButton"
            [rdxDropdownMenuTrigger]="menu"
            [sideOffset]="4"
            [alignOffset]="-5"
            aria-label="Customise options"
        >
            <lucide-angular [img]="MenuIcon" size="16" style="display: flex;" />
        </button>

        <ng-template #menu>
            <div
                class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-56 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md"
                rdxDropdownMenuContent
            >
                <div class="px-2 py-1.5 text-sm font-semibold">My Account</div>
                <div class="bg-muted -mx-1 my-1 h-px" role="separator" aria-orientation="horizontal"></div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>lucide-angular]:size-4 [&>lucide-angular]:shrink-0"
                    rdxDropdownMenuItem
                >
                    New Tab
                    <span class="ml-auto text-xs tracking-widest opacity-60">⌘ T</span>
                </div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxDropdownMenuItem
                >
                    New Window
                    <div class="ml-auto text-xs tracking-widest opacity-60">⌘ N</div>
                </div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxDropdownMenuItem
                    disabled
                >
                    New Private Window
                    <div class="ml-auto text-xs tracking-widest opacity-60">⇧+⌘+N</div>
                </div>
                <div
                    class="focus:bg-accent data-[state=open]:bg-accent flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                    [rdxDropdownMenuTrigger]="share"
                    [side]="DropdownSide.Right"
                    rdxDropdownMenuItem
                >
                    More Tools
                    <div class="ml-auto text-xs tracking-widest opacity-60">></div>
                </div>
                <div class="bg-muted -mx-1 my-1 flex h-px" rdxDropdownMenuSeparator></div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    [(checked)]="itemChecked1"
                    rdxDropdownMenuItemCheckbox
                >
                    <span
                        class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
                        rdxDropdownMenuItemIndicator
                    >
                        <lucide-icon [img]="CheckIcon" size="16" />
                    </span>
                    Show Bookmarks
                    <div class="ml-auto text-xs tracking-widest opacity-60">⌘+B</div>
                </div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    [(checked)]="itemChecked2"
                    rdxDropdownMenuItemCheckbox
                >
                    <span
                        class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
                        rdxDropdownMenuItemIndicator
                    >
                        <lucide-icon [img]="CheckIcon" size="16" />
                    </span>
                    Show Full URLs
                </div>
                <div class="bg-muted -mx-1 my-1 flex h-px" rdxDropdownMenuSeparator></div>
                <div class="px-2 py-1.5 text-sm font-semibold" rdxDropdownMenuLabel>People</div>
                <div [(value)]="selectedValue" (valueChange)="onValueChange($event)" rdxDropdownMenuItemRadioGroup>
                    <div
                        class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        [value]="'1'"
                        rdxDropdownMenuItemRadio
                    >
                        <span
                            class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
                            rdxDropdownMenuItemIndicator
                        >
                            <lucide-icon [img]="DotIcon" size="16" strokeWidth="8" />
                        </span>
                        Pedro Duarte
                    </div>
                    <div
                        class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        [value]="'2'"
                        rdxDropdownMenuItemRadio
                    >
                        <div class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                            <span
                                class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
                                rdxDropdownMenuItemIndicator
                            >
                                <lucide-icon [img]="DotIcon" size="16" strokeWidth="8" />
                            </span>
                        </div>
                        Colm Tuite
                    </div>
                </div>
            </div>
        </ng-template>

        <ng-template #share>
            <div
                class="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-56 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md"
                rdxDropdownMenuContent
            >
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxDropdownMenuItem
                >
                    Save Page As...
                    <div class="ml-auto text-xs tracking-widest opacity-60">⌘+S</div>
                </div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxDropdownMenuItem
                >
                    Create Shortcut...
                </div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxDropdownMenuItem
                >
                    Name Windows...
                </div>
                <div class="bg-muted -mx-1 my-1 flex h-px" rdxDropdownMenuSeparator></div>
                <div
                    class="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    rdxDropdownMenuItem
                >
                    Developer Tools
                </div>
            </div>
        </ng-template>
    `
})
export class DropdownMenuDemo {
    protected readonly MenuIcon = Menu;
    protected readonly CheckIcon = Check;
    protected readonly DotIcon = Dot;

    protected readonly DropdownSide = DropdownSide;

    itemChecked1 = true;
    itemChecked2 = false;

    selectedValue = '1';

    onValueChange(value: string) {
        this.selectedValue = value;
    }
}

export default DropdownMenuDemo;
