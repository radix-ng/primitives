import { CdkMenu } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import {
    RdxDropdownMenuItemIndicatorDirective,
    RdxDropdownMenuTriggerDirective
} from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuBarDirective } from '@radix-ng/primitives/menubar';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    ShDropdownMenuCheckboxItemDirective,
    ShDropdownMenuContent,
    ShDropdownMenuItem,
    ShDropdownMenuLabel,
    ShDropdownMenuSeparator,
    ShDropdownMenuShortcut
} from '@radix-ng/shadcn/dropdown-menu';
import { LucideAngularModule } from 'lucide-angular';

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
        ShDropdownMenuCheckboxItemDirective,
        CdkMenu,
        LucideAngularModule,
        RdxDropdownMenuItemIndicatorDirective
    ],
    template: `
        <button [rdxDropdownMenuTrigger]="menu" shButton variant="outline" sideOffset="4" alignOffset="-5">Open</button>

        <ng-template #menu>
            <div class="w-56" shDropdownMenuContent>
                <div shDropdownMenuLabel>Appearance</div>
                <div shDropdownMenuSeparator></div>
                <button
                    [checked]="showStatusBar"
                    (onCheckedChange)="showStatusBarChange($event)"
                    (click)="showStatusBar = !showStatusBar"
                    shDropdownMenuCheckboxItem
                >
                    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <div rdxDropdownMenuItemIndicator>
                            <lucide-icon size="16" name="check"></lucide-icon>
                        </div>
                    </span>
                    Status Bar
                </button>
                <button [checked]="showActivityBar" shDropdownMenuCheckboxItem>Activity Bar</button>
                <button [checked]="showPanel" shDropdownMenuCheckboxItem>Panel</button>
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
