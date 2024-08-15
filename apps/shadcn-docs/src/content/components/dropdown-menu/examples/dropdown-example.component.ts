import { CdkMenu } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuGroupDirective } from '@radix-ng/primitives/menu';
import { RdxMenuBarDirective } from '@radix-ng/primitives/menubar';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuContentComponent,
    ShDropdownMenuItem,
    ShDropdownMenuLabelComponent,
    ShDropdownMenuSeparatorComponent,
    ShDropdownMenuShortcut
} from '@radix-ng/shadcn/dropdown-menu';

@Component({
    standalone: true,
    imports: [
        RdxMenuBarDirective,
        RdxDropdownMenuTriggerDirective,
        ShButtonDirective,
        ShDropdownMenuContentComponent,
        ShDropdownMenuSeparatorComponent,
        ShDropdownMenuLabelComponent,
        ShDropdownMenuItem,
        ShDropdownMenuShortcut,
        RdxMenuGroupDirective,
        CdkMenu
    ],
    template: `
        <button [rdxDropdownMenuTrigger]="menu" shButton variant="outline">Open</button>

        <ng-template #menu>
            <shDropdownMenuContent class="w-56">
                <shDropdownMenuLabel>My Account</shDropdownMenuLabel>
                <shDropdownMenuSeparator />
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
            </shDropdownMenuContent>
        </ng-template>
    `
})
export class DropdownExampleComponent {
    protected readonly RdxDropdownMenuTriggerDirective = RdxDropdownMenuTriggerDirective;
}
