import { Component } from '@angular/core';
import {
    RdxDropdownMenuContentDirective,
    RdxDropdownMenuItemDirective, RdxDropdownMenuLabelDirective, RdxDropdownMenuSeparatorDirective,
    RdxDropdownMenuTriggerDirective
} from '@radix-ng/primitives/dropdown-menu';
import { LucideAngularModule } from 'lucide-angular';
import { RdxDropdownMenuItemCheckboxDirective } from '../src/dropdown-menu-item-checkbox.directive';
import {
    RdxDropdownMenuItemIndicatorDirective
} from '../src/dropdown-menu-item-indicator.directive';

@Component({
    selector: 'dropdown-menu-item-checkbox',
    styleUrl: 'dropdown-menu-item-checkbox.styles.scss',
    template: `
        <button [rdxDropdownMenuTrigger]="menu"
                sideOffset="4"
                alignOffset="-5"
                class="IconButton" aria-label="Customise options">
            <lucide-angular size="16" name="menu" style="height: 1.2rem;"></lucide-angular>
        </button>

        <ng-template #menu>
            <div class="DropdownMenuContent" rdxDropdownMenuContent>
                <button class="DropdownMenuItem"
                        rdxDropdownMenuItemCheckbox
                        [checked]="itemState"
                        (onCheckedChange)="onCheckedChange($event)"
                        (onSelect)="onSelect()"
                        (click)="itemState = !itemState">
                    <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                        <lucide-icon size="16" name="check"></lucide-icon>
                    </div>
                    New Tab <div class="RightSlot">⌘ T</div>
                </button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem disabled>
                    New Window <div class="RightSlot">⌘ N</div>
                </button>
                <button
                    class="DropdownMenuItem"
                    rdxDropdownMenuItemCheckbox
                    [checked]="itemState2"
                    (onCheckedChange)="onCheckedChange($event)"
                    (onSelect)="onSelect()"
                    (click)="itemState2 = !itemState2"
                >
                    <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                        <lucide-icon size="16" name="check"></lucide-icon>
                    </div>
                    New Incognito Window
                </button>
                <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
                <div class="DropdownMenuLabel" rdxDropdownMenuLabel>
                    Label
                </div>
                <button
                    class="DropdownMenuItem DropdownMenuSubTrigger"
                    rdxDropdownMenuItem
                    (onSelect)="onSelect()"
                >
                    Share
                </button>
                <div rdxDropdownMenuSeparator class="DropdownMenuSeparator"></div>
                <button class="DropdownMenuItem"
                        rdxDropdownMenuItem
                        (onSelect)="onSelect()">
                    Print… <div class="RightSlot">⌘ P</div>
                </button>
            </div>
        </ng-template>
    `,
    standalone: true,
    imports: [
        RdxDropdownMenuTriggerDirective,
        RdxDropdownMenuItemDirective,
        RdxDropdownMenuItemCheckboxDirective,
        RdxDropdownMenuItemIndicatorDirective,
        RdxDropdownMenuSeparatorDirective,
        RdxDropdownMenuContentDirective,
        RdxDropdownMenuLabelDirective,

        LucideAngularModule
    ]
})
export class DropdownMenuItemCheckboxExampleComponent {
    itemState = true;
    itemState2 = false;

    onCheckedChange(value: boolean) {
        console.log('onCheckedChange', value);
    }

    onSelect() {
        console.log('onSelect', );
    }
}
