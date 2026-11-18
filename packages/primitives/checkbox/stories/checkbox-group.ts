import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

/**
 * `rdxCheckboxGroup` holds the array of checked values. Each child participates by its `value`, and
 * the checkbox marked `parent` becomes a "select all" whose state (checked / indeterminate /
 * unchecked) is derived from `allValues` — no manual wiring.
 *
 * Try the parent from a partial selection: it cycles partial → all → none → back to your partial
 * selection, instead of a flat all/none toggle.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-group-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxGroupDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div class="flex flex-col gap-3" #group="rdxCheckboxGroup" [(value)]="value" [allValues]="all" rdxCheckboxGroup>
            <div class="flex items-center gap-3">
                <div parent rdxCheckboxRoot>
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="all"
                        rdxCheckboxButton
                    >
                        <svg
                            class="text-primary flex items-center"
                            [lucideIcon]="group.parentState() === 'indeterminate' ? 'minus' : 'check'"
                            rdxCheckboxIndicator
                            size="16"
                        />
                    </button>
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ml-6 flex flex-col gap-3">
                @for (item of items; track item.value) {
                    <div class="flex items-center gap-3">
                        <div [value]="item.value" rdxCheckboxRoot>
                            <button
                                class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                [id]="item.value"
                                rdxCheckboxButton
                            >
                                <svg
                                    class="text-primary flex items-center"
                                    rdxCheckboxIndicator
                                    size="16"
                                    lucideCheck
                                />
                            </button>
                        </div>
                        <label class="text-foreground text-sm font-medium" [htmlFor]="item.value" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxGroupExample {
    protected readonly items = [
        { value: 'apples', label: 'Apples' },
        { value: 'bananas', label: 'Bananas' },
        { value: 'cherries', label: 'Cherries' }
    ];

    protected readonly all = this.items.map((item) => item.value);

    value = signal<string[]>(['apples']);
}
