import { Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoCombobox } from '../../storybook/styles';
import { _importsCombobox } from '../index';

const ALL = ['Angular', 'Astro', 'Ember', 'Lit', 'Preact', 'Qwik', 'React', 'Solid', 'Svelte', 'Vue'];

/**
 * External filtering with `[filter]="null"`: the combobox does no matching of its own; the consumer
 * owns the rendered list. Here a fake async request populates results, and `RdxComboboxStatus`
 * announces loading / counts to assistive technology.
 */
@Component({
    selector: 'combobox-async',
    imports: [_importsCombobox, LucideChevronDown, LucideCheck],
    template: `
        <div [(value)]="value" [filter]="null" (onInputValueChange)="search($event)" rdxComboboxRoot>
            <div [class]="c.control">
                <input [class]="c.input" rdxComboboxInput placeholder="Search frameworks…" aria-label="Framework" />
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
export class ComboboxAsync {
    protected readonly c = demoCombobox;
    readonly value = signal<string | null>(null);
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
