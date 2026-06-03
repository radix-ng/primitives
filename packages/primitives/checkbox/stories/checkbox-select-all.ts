import { Component, computed, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { CheckedState, RdxCheckboxRootDirective } from '../src/checkbox-root';

interface Item {
    id: string;
    label: string;
    checked: boolean;
}

/**
 * A "select all" parent whose state is derived from its children: checked when
 * all are ticked, `indeterminate` when only some are, unchecked otherwise.
 */
@Component({
    selector: 'checkbox-select-all-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
                <div [checked]="parentState()" (onCheckedChange)="toggleAll($event)" rdxCheckboxRoot>
                    <button id="all" [class]="c.button" rdxCheckboxButton>
                        <svg
                            [class]="c.indicator"
                            [lucideIcon]="parentState() === 'indeterminate' ? 'minus' : 'check'"
                            rdxCheckboxIndicator
                            size="16"
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ml-6 flex flex-col gap-3">
                @for (item of items(); track item.id) {
                    <div class="flex items-center gap-3">
                        <div [checked]="item.checked" (onCheckedChange)="toggleItem(item.id, $event)" rdxCheckboxRoot>
                            <button [class]="c.button" [id]="item.id" rdxCheckboxButton>
                                <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                            </button>
                            <input rdxCheckboxInput />
                        </div>
                        <label class="text-foreground text-sm font-medium" [htmlFor]="item.id" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxSelectAllExample {
    protected readonly c = demoCheckbox;

    readonly items = signal<Item[]>([
        { id: 'apples', label: 'Apples', checked: true },
        { id: 'bananas', label: 'Bananas', checked: false },
        { id: 'cherries', label: 'Cherries', checked: false }
    ]);

    protected readonly parentState = computed<CheckedState>(() => {
        const items = this.items();
        if (items.every((item) => item.checked)) {
            return true;
        }
        return items.some((item) => item.checked) ? 'indeterminate' : false;
    });

    protected toggleAll(state: CheckedState): void {
        // Clicking the parent resolves indeterminate -> checked (tick all), or
        // checked -> unchecked (clear all).
        const checked = state === true;
        this.items.update((items) => items.map((item) => ({ ...item, checked })));
    }

    protected toggleItem(id: string, state: CheckedState): void {
        const checked = state === true;
        this.items.update((items) => items.map((item) => (item.id === id ? { ...item, checked } : item)));
    }
}
