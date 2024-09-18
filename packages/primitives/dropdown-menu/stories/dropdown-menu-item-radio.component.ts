import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RdxDropdownMenuContentDirective } from '../src/dropdown-menu-content.directive';
import { RdxDropdownMenuItemIndicatorDirective } from '../src/dropdown-menu-item-indicator.directive';
import { RdxDropdownMenuItemRadioGroupDirective } from '../src/dropdown-menu-item-radio-group.directive';
import { RdxDropdownMenuItemRadioDirective } from '../src/dropdown-menu-item-radio.directive';
import { RdxDropdownMenuItemDirective } from '../src/dropdown-menu-item.directive';
import { RdxDropdownMenuLabelDirective } from '../src/dropdown-menu-label.directive';
import { RdxDropdownMenuSeparatorDirective } from '../src/dropdown-menu-separator.directive';
import { RdxDropdownMenuTriggerDirective } from '../src/dropdown-menu-trigger.directive';

@Component({
    selector: 'dropdown-menu-item-radio',
    styleUrl: 'dropdown-menu-item-radio.styles.scss',
    template: `
        <button
            class="IconButton"
            [rdxDropdownMenuTrigger]="menu"
            sideOffset="4"
            alignOffset="-5"
            aria-label="Customise options"
        >
            <lucide-angular size="16" name="menu" style="height: 1.2rem;" />
        </button>
        <ng-template #menu>
            <div class="DropdownMenuContent" [closeOnEscape]="false" rdxDropdownMenuContent>
                <div [(value)]="selectedValue" (valueChange)="onValueChange($event)" rdxDropdownMenuItemRadioGroup>
                    <div class="DropdownMenuItem" [value]="'1'" rdxDropdownMenuItemRadio>
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon size="16" name="dot" strokeWidth="8" />
                        </div>
                        New Tab
                        <div class="RightSlot">⌘ T</div>
                    </div>
                    <div class="DropdownMenuItem" [value]="'2'" disabled rdxDropdownMenuItemRadio>
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon size="16" name="dot" strokeWidth="8" />
                        </div>
                        New Window
                        <div class="RightSlot">⌘ N</div>
                    </div>
                    <div class="DropdownMenuItem" [value]="'3'" rdxDropdownMenuItemRadio>
                        <div class="DropdownMenuItemIndicator" rdxDropdownMenuItemIndicator>
                            <lucide-icon size="16" name="dot" strokeWidth="8" />
                        </div>
                        New Incognito Window
                    </div>
                </div>
                <div class="DropdownMenuSeparator" rdxDropdownMenuSeparator></div>
                <div class="DropdownMenuLabel" rdxDropdownMenuLabel>Label</div>
                <button class="DropdownMenuItem" [rdxDropdownMenuTrigger]="share" [side]="'right'" rdxDropdownMenuItem>
                    Share
                    <div class="RightSlot">></div>
                </button>
                <div class="DropdownMenuSeparator" rdxDropdownMenuSeparator></div>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>
                    Print…
                    <div class="RightSlot">⌘ P</div>
                </button>
            </div>
        </ng-template>

        <ng-template #share>
            <div class="DropdownMenuSubContent" rdxDropdownMenuContent>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Undo</button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Redo</button>
                <div class="DropdownMenuSeparator" rdxDropdownMenuSeparator></div>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Cut</button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Copy</button>
                <button class="DropdownMenuItem" rdxDropdownMenuItem>Paste</button>
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
    selectedValue = '2';

    onValueChange(value: string) {
        this.selectedValue = value;

        console.log('this.selectedValue', this.selectedValue);
    }
}
