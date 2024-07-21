import { CdkMenu } from '@angular/cdk/menu';
import { Component } from '@angular/core';

import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuGroupDirective } from '@radix-ng/primitives/menu';
import { RdxMenuBarDirective } from '@radix-ng/primitives/menubar';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuContent,
    ShDropdownMenuItem,
    ShDropdownMenuLabel,
    ShDropdownMenuSeparator,
    ShDropdownMenuShortcut
} from '@radix-ng/shadcn/dropdown-menu';

@Component({
    standalone: true,
    imports: [
        RdxMenuBarDirective,
        RdxDropdownMenuTriggerDirective,
        ShButtonDirective,
        ShDropdownMenuContent,
        ShDropdownMenuSeparator,
        ShDropdownMenuLabel,
        ShDropdownMenuItem,
        ShDropdownMenuShortcut,
        RdxMenuGroupDirective,

        CdkMenu
    ],
    template: `
        <button
            shButton
            variant="outline"
            [DropdownMenuTrigger]="menu"
            [DropdownMenuPosition]="[
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetY: 4
                }
            ]"
        >
            Open
        </button>

        <ng-template #menu>
            <div shDropdownMenuContent class="w-56">
                <div shDropdownMenuLabel>My Account</div>
                <div shDropdownMenuSeparator></div>
                <div MenuGroup>
                    <div shDropdownMenuItem>
                        <span>Profile</span>
                        <span shDropdownMenuShortcut>⇧⌘P</span>
                    </div>
                    <div shDropdownMenuItem>
                        <span>Billing</span>
                        <span shDropdownMenuShortcut>⌘B</span>
                    </div>
                    <div shDropdownMenuItem>
                        <span>Keyboard shortcuts</span>
                        <span shDropdownMenuShortcut>⌘K</span>
                    </div>
                </div>
            </div>
        </ng-template>
    `
})
export class DropdownExampleComponent {
    protected readonly RdxDropdownMenuTriggerDirective = RdxDropdownMenuTriggerDirective;
}
