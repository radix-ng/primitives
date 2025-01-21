import { Component, signal } from '@angular/core';
import { MenuModule } from '@radix-ng/primitives/menu';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'menu-checkbox-items-story',
    imports: [MenuModule, LucideAngularModule],
    styleUrl: 'styles.css',
    template: `
        <div class="MenuRoot" MenuRoot>
            <div class="MenuTrigger" [menuTriggerFor]="menuGroup" sideOffset="8" MenuItem MenuTrigger>File</div>
        </div>

        <ng-template #menuGroup>
            <div class="MenuContent" MenuContent>
                <div
                    class="MenuCheckboxItem inset"
                    [checked]="checkedState()"
                    (menuItemTriggered)="handleSelectAll()"
                    MenuItemCheckbox
                >
                    Select All
                    <lucide-icon class="MenuItemIndicator" [img]="X" MenuItemIndicator size="16" strokeWidth="2" />
                </div>

                <div class="MenuSeparator" MenuSeparator></div>
                @for (item of options(); track $index) {
                    <div
                        class="MenuCheckboxItem inset"
                        [checked]="selectedItems.includes(item)"
                        (menuItemTriggered)="handleSelection(item)"
                        MenuItemCheckbox
                    >
                        {{ item }}
                        <lucide-icon class="MenuItemIndicator" [img]="X" MenuItemIndicator size="16" strokeWidth="2" />
                    </div>
                }
            </div>
        </ng-template>
    `
})
export class MenuCheckboxItemsStory {
    options = signal<string[]>(['Crows', 'Ravens', 'Magpies', 'Jackdaws']);

    selectedItems = this.options();

    handleSelection(option: string) {
        if (this.selectedItems.includes(option)) {
            this.selectedItems = this.selectedItems.filter((el) => el !== option);
        } else {
            this.selectedItems = this.selectedItems.concat(option);
        }
    }

    handleSelectAll() {
        if (this.selectedItems.length === this.options().length) this.selectedItems = [];
        else this.selectedItems = this.options();
    }

    checkedState() {
        return this.selectedItems.length === this.options().length
            ? true
            : this.selectedItems.length > 0
              ? 'indeterminate'
              : false;
    }

    protected readonly X = X;
}
