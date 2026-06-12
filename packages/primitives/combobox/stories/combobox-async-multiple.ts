import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideX } from '@lucide/angular';
import { cn, demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

const ALL = ['Angular', 'Astro', 'Ember', 'Lit', 'Preact', 'Qwik', 'React', 'Solid', 'Svelte', 'Vue'];

/** External filtering (`[filter]="null"`) combined with multiple selection: results load
 * asynchronously and picks become chips, while `RdxComboboxStatus` announces loading / counts. */
@Component({
    selector: 'combobox-async-multiple',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck, LucideX],
    template: `
        <div [(value)]="value" [filter]="null" (onInputValueChange)="search($event)" multiple rdxComboboxRoot>
            <div [class]="control" rdxComboboxAnchor>
                @if (value().length) {
                    <div [class]="c.chips" rdxComboboxChips>
                        @for (item of value(); track item) {
                            <span [class]="c.chip" [value]="item" rdxComboboxChip>
                                {{ item }}
                                <button [class]="c.chipRemove" rdxComboboxChipRemove aria-label="Remove">
                                    <svg lucideX size="12"></svg>
                                </button>
                            </span>
                        }
                    </div>
                }
                <input
                    [class]="c.inputInline"
                    [placeholder]="value().length ? '' : 'Add frameworks…'"
                    rdxComboboxInput
                    aria-label="Frameworks"
                />
                <button [class]="c.trigger" rdxComboboxTrigger aria-label="Open">
                    <svg lucideChevronDown size="16"></svg>
                </button>
            </div>

            <div *rdxComboboxPortal [class]="c.positioner" rdxComboboxPositioner>
                <div [class]="c.popup" rdxComboboxPopup>
                    <div class="text-muted-foreground px-2 py-1 text-xs" rdxComboboxStatus>
                        @if (loading()) {
                            Loading…
                        } @else {
                            {{ results().length }} results
                        }
                    </div>
                    <div [class]="c.list" rdxComboboxList aria-label="Frameworks">
                        @for (item of results(); track item) {
                            <div [class]="c.item" [value]="item" rdxComboboxItem>
                                <span [class]="c.itemIndicator" rdxComboboxItemIndicator>
                                    <svg lucideCheck size="14"></svg>
                                </span>
                                {{ item }}
                            </div>
                        }
                    </div>
                    @if (!loading() && results().length === 0) {
                        <div [class]="c.empty" rdxComboboxEmpty>Nothing found.</div>
                    }
                </div>
            </div>
        </div>
    `
})
export class ComboboxAsyncMultiple {
    protected readonly c = demoCombobox;
    protected readonly control = cn(demoCombobox.control, 'h-auto min-h-9 flex-wrap items-center gap-1 py-1 pl-1');
    readonly value = signal<string[]>([]);
    readonly results = signal<string[]>(ALL);
    readonly loading = signal(false);

    private handle: ReturnType<typeof setTimeout> | undefined;

    search(query: string): void {
        this.loading.set(true);
        clearTimeout(this.handle);
        this.handle = setTimeout(() => {
            const q = query.trim().toLowerCase();
            this.results.set(q ? ALL.filter((item) => item.toLowerCase().includes(q)) : ALL);
            this.loading.set(false);
        }, 300);
    }
}
