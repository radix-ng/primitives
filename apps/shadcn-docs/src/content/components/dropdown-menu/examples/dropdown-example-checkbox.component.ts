import { CdkMenu } from '@angular/cdk/menu';
import { Component } from '@angular/core';
import { RdxDropdownMenuTriggerDirective } from '@radix-ng/primitives/dropdown-menu';
import { RdxMenuGroupDirective } from '@radix-ng/primitives/menu';
import { RdxMenuBarDirective } from '@radix-ng/primitives/menubar';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import {
    DropdownMenuCheckboxItemComponent,
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
        DropdownMenuCheckboxItemComponent,
        CdkMenu
    ],
    template: `
        <button [rdxDropdownMenuTrigger]="menu" shButton variant="outline" sideOffset="4" alignOffset="-5">Open</button>

        <ng-template #menu>
            <div class="w-56" shDropdownMenuContent>
                <div shDropdownMenuLabel>Appearance</div>
                <div shDropdownMenuSeparator></div>
                <sh-dropdown-menu-checkbox-item
                    [shChecked]="showStatusBar"
                    (checkedChange)="onCheckedChangeShowStatusBar($event)"
                >
                    Status Bar
                </sh-dropdown-menu-checkbox-item>
                <sh-dropdown-menu-checkbox-item [shChecked]="showActivityBar">
                    Activity Bar
                </sh-dropdown-menu-checkbox-item>
                <sh-dropdown-menu-checkbox-item [shChecked]="showPanel">Panel</sh-dropdown-menu-checkbox-item>
            </div>
        </ng-template>
    `
})
export class DropdownExampleCheckboxComponent {
    showStatusBar = false;
    showActivityBar = false;
    showPanel = true;

    onCheckedChangeShowStatusBar($event: boolean) {
        this.showStatusBar = $event;
        console.log(this.showStatusBar);
    }
}
