import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-checkbox-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>Options</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <label
                        class="demo-menu-selectable-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50"
                        [checked]="checkedState()"
                        (onCheckedChange)="handleSelectAll()"
                        rdxMenuCheckboxItem
                    >
                        <span
                            class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                            rdxMenuCheckboxItemIndicator
                        >
                            ✓
                        </span>
                        Select All
                    </label>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    @for (item of options(); track item) {
                        <label
                            class="demo-menu-selectable-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50"
                            [checked]="selectedItems().includes(item)"
                            (onCheckedChange)="handleSelection(item)"
                            rdxMenuCheckboxItem
                        >
                            <span
                                class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                rdxMenuCheckboxItemIndicator
                            >
                                ✓
                            </span>
                            {{ item }}
                        </label>
                    }
                </div>
            </div>
        </ng-container>
    `
})
export class MenuCheckboxItemsStory {
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
