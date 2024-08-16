import { Component } from '@angular/core';
import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuContentComponent,
    ShDropdownMenuLabelComponent,
    ShDropdownMenuRadioGroupComponent,
    ShDropdownMenuRadioItemComponent,
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
        ShDropdownMenuRadioItemComponent,
        ShDropdownMenuRadioGroupComponent
    ],
    template: `
        <button [rdxDropdownMenuTrigger]="menuPosition" shButton variant="outline" sideOffset="4" alignOffset="-5">
            Open
        </button>

        <ng-template #menuPosition>
            <shDropdownMenuContent class="w-56">
                <shDropdownMenuLabel>Panel Position</shDropdownMenuLabel>
                <shDropdownMenuSeparator />
                <shDropdownMenuRadioGroup [(value)]="position" (valueChange)="onValueChange($event)">
                    <shDropdownMenuRadioItem [value]="'top'">Top</shDropdownMenuRadioItem>
                    <shDropdownMenuRadioItem [value]="'bottom'">Bottom</shDropdownMenuRadioItem>
                    <shDropdownMenuRadioItem [value]="'right'">Right</shDropdownMenuRadioItem>
                </shDropdownMenuRadioGroup>
            </shDropdownMenuContent>
        </ng-template>
    `
})
export class DropdownExampleRadioComponent {
    position = 'bottom';

    onValueChange(value: string) {
        this.position = value;
    }
}
