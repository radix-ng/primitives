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
    selector: 'dropdown-menu-demo',
    standalone: true,
    styleUrl: 'dropdown-menu-demo.css',
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
            sideOffset="4"
            alignOffset="-5"
            aria-label="Customise options"
        >
            <lucide-angular [img]="MenuIcon" size="16" style="display: flex;" />
        </button>

        <ng-template #menu>
            <div class="DropdownMenuContent" rdxDropdownMenuContent>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>
                    New Tab
                    <div class="RightSlot">⌘ T</div>
                </button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>
                    New Window
                    <div class="RightSlot">⌘ N</div>
                </button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem disabled>
                    New Private Window
                    <div class="RightSlot">⇧+⌘+N</div>
                </button>
                <button
                    class="DropdownMenuItem DropdownMenuSubTrigger"
                    [rdxDropdownMenuTrigger]="share"
                    [side]="DropdownSide.Right"
                    rdxDropdownMenuItem
                >
                    More Tools
                    <div class="RightSlot">></div>
                </button>
                <div class="DropdownMenuSeparator" rdxDropdownMenuSeparator></div>
                <button class="DropdownMenuItem" [(checked)]="itemChecked1" rdxDropdownMenuItemCheckbox>
                    <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                        <lucide-icon [img]="CheckIcon" size="13" />
                    </div>
                    Show Bookmarks
                    <div class="RightSlot">⌘+B</div>
                </button>
                <button class="DropdownMenuItem" [(checked)]="itemChecked2" rdxDropdownMenuItemCheckbox>
                    <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                        <lucide-icon [img]="CheckIcon" size="13" />
                    </div>
                    Show Full URLs
                </button>
                <div class="DropdownMenuSeparator" rdxDropdownMenuSeparator></div>
                <div class="DropdownMenuLabel" rdxDropdownMenuLabel>People</div>
                <div [(value)]="selectedValue" (valueChange)="onValueChange($event)" rdxDropdownMenuItemRadioGroup>
                    <div class="DropdownMenuRadioItem" [value]="'1'" rdxDropdownMenuItemRadio>
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon [img]="DotIcon" size="13" strokeWidth="6" />
                        </div>
                        Pedro Duarte
                    </div>
                    <div class="DropdownMenuRadioItem" [value]="'2'" rdxDropdownMenuItemRadio>
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon [img]="DotIcon" size="13" strokeWidth="6" />
                        </div>
                        Colm Tuite
                    </div>
                </div>
            </div>
        </ng-template>

        <ng-template #share>
            <div class="DropdownMenuSubContent" rdxDropdownMenuContent>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>
                    Save Page As...
                    <div class="RightSlot">⌘+S</div>
                </button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Create Shortcut...</button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Name Windows...</button>
                <div class="DropdownMenuSeparator" rdxDropdownMenuSeparator></div>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Developer Tools</button>
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
