import { Component } from '@angular/core';
import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuCheckboxItemComponent,
    ShDropdownMenuContent,
    ShDropdownMenuLabel,
    ShDropdownMenuSeparator
} from '@radix-ng/shadcn/dropdown-menu';

@Component({
    standalone: true,
    imports: [
        RdxDropdownMenuTriggerDirective,
        ShButtonDirective,
        ShDropdownMenuContent,
        ShDropdownMenuSeparator,
        ShDropdownMenuLabel,
        ShDropdownMenuCheckboxItemComponent
    ],
    template: `
        <button [rdxDropdownMenuTrigger]="menu" shButton variant="outline" sideOffset="4" alignOffset="-5">Open</button>

        <ng-template #menu>
            <div class="w-56" shDropdownMenuContent>
                <div shDropdownMenuLabel>Appearance</div>
                <div shDropdownMenuSeparator></div>
                <sh-dropdown-menu-checkbox-item
                    [(checked)]="showStatusBar"
                    (checkedChange)="showStatusBarChange($event)"
                >
                    Status Bar
                </sh-dropdown-menu-checkbox-item>
                <sh-dropdown-menu-checkbox-item [(checked)]="showActivityBar">
                    Activity Bar
                </sh-dropdown-menu-checkbox-item>
                <sh-dropdown-menu-checkbox-item [(checked)]="showPanel">Panel</sh-dropdown-menu-checkbox-item>
            </div>
        </ng-template>
    `
})
export class DropdownExampleCheckboxComponent {
    showStatusBar = true;
    showActivityBar = false;
    showPanel = true;

    showStatusBarChange(value: boolean) {
        console.info('showStatusBarChange value: ', value);
    }
}
