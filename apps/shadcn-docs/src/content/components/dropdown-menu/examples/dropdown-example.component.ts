import { Component } from '@angular/core';
import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuContentComponent,
    ShDropdownMenuGroupComponent,
    ShDropdownMenuItemComponent,
    ShDropdownMenuLabelComponent,
    ShDropdownMenuSeparatorComponent,
    ShDropdownMenuShortcutComponent
} from '@radix-ng/shadcn/dropdown-menu';

@Component({
    standalone: true,
    imports: [
        RdxDropdownMenuTriggerDirective,
        ShButtonDirective,
        ShDropdownMenuContentComponent,
        ShDropdownMenuSeparatorComponent,
        ShDropdownMenuLabelComponent,
        ShDropdownMenuItemComponent,
        ShDropdownMenuShortcutComponent,
        ShDropdownMenuGroupComponent
    ],
    template: `
        <button [rdxDropdownMenuTrigger]="menu" shButton variant="outline" sideOffset="4" alignOffset="-5">Open</button>

        <ng-template #menu>
            <shDropdownMenuContent class="w-56">
                <shDropdownMenuLabel>My Account</shDropdownMenuLabel>
                <shDropdownMenuSeparator />
                <shDropdownMenuGroup>
                    <shDropdownMenuItem>
                        <span>Profile</span>
                        <shDropdownMenuShortcut>⇧⌘P</shDropdownMenuShortcut>
                    </shDropdownMenuItem>
                    <shDropdownMenuItem>
                        <span>Billing</span>
                        <shDropdownMenuShortcut>⌘B</shDropdownMenuShortcut>
                    </shDropdownMenuItem>
                    <shDropdownMenuItem>
                        <span>Keyboard shortcuts</span>
                        <shDropdownMenuShortcut>⌘K</shDropdownMenuShortcut>
                    </shDropdownMenuItem>
                </shDropdownMenuGroup>
            </shDropdownMenuContent>
        </ng-template>
    `
})
export class DropdownExampleComponent {}
