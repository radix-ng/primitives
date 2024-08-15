import { Component } from '@angular/core';
import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuCheckboxItemComponent,
    ShDropdownMenuContentComponent,
    ShDropdownMenuLabelComponent,
    ShDropdownMenuSeparatorComponent
} from '@radix-ng/shadcn/dropdown-menu';

@Component({
    standalone: true,
    imports: [
        RdxDropdownMenuTriggerDirective,
        ShButtonDirective,
        ShDropdownMenuContentComponent,
        ShDropdownMenuSeparatorComponent,
        ShDropdownMenuLabelComponent,
        ShDropdownMenuCheckboxItemComponent
    ],
    template: `
        <button [rdxDropdownMenuTrigger]="menu" shButton variant="outline" sideOffset="4" alignOffset="-5">Open</button>

        <ng-template #menu>
            <shDropdownMenuContent class="w-56">
                <shDropdownMenuLabel>Appearance</shDropdownMenuLabel>
                <shDropdownMenuSeparator />
                <shDropdownMenuCheckboxItem [(checked)]="showStatusBar" (checkedChange)="showStatusBarChange($event)">
                    Status Bar
                </shDropdownMenuCheckboxItem>
                <shDropdownMenuCheckboxItem [(checked)]="showActivityBar">Activity Bar</shDropdownMenuCheckboxItem>
                <shDropdownMenuCheckboxItem [(checked)]="showPanel">Panel</shDropdownMenuCheckboxItem>
            </shDropdownMenuContent>
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
