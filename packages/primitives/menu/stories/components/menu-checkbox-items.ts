import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'menu-checkbox-items-story',
    imports: [RdxMenuModule, LucideAngularModule],
    styleUrl: 'styles.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="MenuRoot" RdxMenuRoot>
            <div
                class="MenuTrigger"
                [menuTriggerFor]="menuGroup"
                align="start"
                sideOffset="5"
                alignOffset="-3"
                RdxMenuItem
                RdxMenuTrigger
            >
                File
            </div>
        </div>

        <ng-template #menuGroup>
            <div class="MenuContent" RdxMenuContent>
                <div
                    class="MenuCheckboxItem inset"
                    [checked]="checkedState()"
                    (menuItemTriggered)="handleSelectAll()"
                    RdxMenuItemCheckbox
                >
                    Select All
                    <lucide-icon class="MenuItemIndicator" [img]="X" RdxMenuItemIndicator size="16" strokeWidth="2" />
                </div>

                <div class="MenuSeparator" RdxMenuSeparator></div>
                @for (item of options(); track $index) {
                    <div
                        class="MenuCheckboxItem inset"
                        [checked]="selectedItems.includes(item)"
                        (menuItemTriggered)="handleSelection(item)"
                        RdxMenuItemCheckbox
                    >
                        {{ item }}
                        <lucide-icon
                            class="MenuItemIndicator"
                            [img]="X"
                            RdxMenuItemIndicator
                            size="16"
                            strokeWidth="2"
                        />
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
