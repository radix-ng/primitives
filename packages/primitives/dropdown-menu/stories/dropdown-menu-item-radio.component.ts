import { Component } from '@angular/core';
import {
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective, RdxDropdownMenuLabelDirective, RdxDropdownMenuSeparatorDirective,
    RdxDropdownMenuTriggerDirective
} from '@radix-ng/primitives/dropdown-menu';
import { LucideAngularModule } from 'lucide-angular';
import {
    RdxDropdownMenuItemRadioGroupDirective
} from '../src/dropdown-menu-item-radio-group.directive';
import { RdxDropdownMenuItemRadioDirective } from '../src/dropdown-menu-item-radio.directive';
import {
    RdxDropdownMenuItemIndicatorDirective
} from '../src/dropdown-menu-item-indicator.directive';

@Component({
    selector: 'dropdown-menu-item-radio',
    styleUrl: 'dropdown-menu-item-radio.styles.scss',
    template: `
        <button [rdxDropdownMenuTrigger]="menu"
                sideOffset="4"
                alignOffset="-5"
                class="IconButton" aria-label="Customise options">
            <lucide-angular size="16" name="menu" style="height: 1.2rem;"></lucide-angular>
        </button>

        <ng-template #menu>
            <div class="DropdownMenuContent" rdxDropdownMenuContent>
                <div rdxDropdownMenuItemRadioGroup
                     [value]="selectedValue"
                     (onValueChange)="onValueChange($event)">
                    <button class="DropdownMenuItem"
                            rdxDropdownMenuItemRadio
                            [value]="'1'">
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon size="16" name="dot" strokeWidth="8"></lucide-icon>
                        </div>
                        New Tab <div class="RightSlot">⌘ T</div>
                    </button>
                    <button class="DropdownMenuItem"
                            [value]="'2'"
                            rdxDropdownMenuItemRadio>
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon size="16" name="dot" strokeWidth="8"></lucide-icon>
                        </div>
                        New Window <div class="RightSlot">⌘ N</div>
                    </button>
                    <button
                        class="DropdownMenuItem"
                        rdxDropdownMenuItemRadio
                        [value]="'3'"
                    >
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon size="16" name="dot" strokeWidth="8"></lucide-icon>
                        </div>
                        New Incognito Window
                    </button>
                </div>
                <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
                <div class="DropdownMenuLabel" rdxDropdownMenuLabel>
                    Label
                </div>
                <button
                    class="DropdownMenuItem DropdownMenuSubTrigger"
                    rdxDropdownMenuItem
                >
                    Share
                </button>
                <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
                <button class="DropdownMenuItem"
                        rdxDropdownMenuItem>
                    Print… <div class="RightSlot">⌘ P</div>
                </button>
            </div>
        </ng-template>
    `,
    standalone: true,
    imports: [
        RdxDropdownMenuTriggerDirective,
        RdxDropdownMenuItemDirective,
        RdxDropdownMenuItemRadioDirective,
        RdxDropdownMenuItemRadioGroupDirective,
        RdxDropdownMenuItemIndicatorDirective,
        RdxDropdownMenuSeparatorDirective,
        RdxDropdownMenuContentDirective,
        RdxDropdownMenuLabelDirective,

        LucideAngularModule
    ]
})
export class DropdownMenuItemRadioExampleComponent {
    selectedValue = '1';

    onValueChange(value: string) {
        this.selectedValue = value;

        console.log('onValueChange', value);
    }
}
