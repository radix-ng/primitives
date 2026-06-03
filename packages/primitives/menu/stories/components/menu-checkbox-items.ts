import { cn, demoButton, demoMenu } from '../../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-checkbox-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Options</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <label
                        rdxMenuCheckboxItem
                        [class]="m.selectableItem"
                        [checked]="checkedState()"
                        (onCheckedChange)="handleSelectAll()"
                    >
                        <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">✓</span>
                        Select All
                    </label>
                    <div rdxMenuSeparator [class]="m.separator"></div>
                    @for (item of options(); track item) {
                        <label
                            rdxMenuCheckboxItem
                            [class]="m.selectableItem"
                            [checked]="selectedItems().includes(item)"
                            (onCheckedChange)="handleSelection(item)"
                        >
                            <span rdxMenuCheckboxItemIndicator [class]="m.itemIndicator">✓</span>
                            {{ item }}
                        </label>
                    }
                </div>
            </div>
        </ng-container>
    `
})
export class MenuCheckboxItemsStory {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;

    readonly options = signal<string[]>(['Crows', 'Ravens', 'Magpies', 'Jackdaws']);
    readonly selectedItems = signal<string[]>(this.options());

    handleSelection(option: string): void {
        this.selectedItems.update((items) =>
            items.includes(option) ? items.filter((el) => el !== option) : [...items, option]
        );
    }

    handleSelectAll(): void {
        this.selectedItems.update((items) => (items.length === this.options().length ? [] : this.options()));
    }

    checkedState(): boolean | 'indeterminate' {
        const selected = this.selectedItems().length;
        const total = this.options().length;
        return selected === total ? true : selected > 0 ? 'indeterminate' : false;
    }
}
