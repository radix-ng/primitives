import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon, LucideMinus } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxGroupDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
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
        RdxCheckboxIndicatorPresenceDirective,
        LucideDynamicIcon,
        LucideCheck
    ],
    template: `
        <div
            class="flex flex-col items-start gap-1"
            #group="rdxCheckboxGroup"
            [(value)]="value"
            [allValues]="all"
            rdxCheckboxGroup
            aria-label="Fruits"
        >
            <div class="flex items-center gap-2">
                <div parent rdxCheckboxRoot>
                    <button class="demo-choice size-4" id="all" rdxCheckboxButton>
                        <svg
                            class="flex items-center"
                            *rdxCheckboxIndicatorPresence
                            [lucideIcon]="group.parentState() === 'indeterminate' ? minusIcon : checkIcon"
                            rdxCheckboxIndicator
                            size="12"
                        />
                    </button>
                </div>
                <label class="text-foreground text-sm" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ms-4 flex flex-col items-start gap-1">
                @for (item of items; track item.value) {
                    <div class="flex items-center gap-2">
                        <div [value]="item.value" rdxCheckboxRoot>
                            <button class="demo-choice size-4" [id]="item.value" rdxCheckboxButton>
                                <svg
                                    class="flex items-center"
                                    *rdxCheckboxIndicatorPresence
                                    rdxCheckboxIndicator
                                    size="12"
                                    lucideCheck
                                />
                            </button>
                        </div>
                        <label class="text-foreground text-sm" [htmlFor]="item.value" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxGroupExample {
    protected readonly minusIcon = LucideMinus;
    protected readonly checkIcon = LucideCheck;
    protected readonly items = [
        { value: 'apples', label: 'Apples' },
        { value: 'bananas', label: 'Bananas' },
        { value: 'cherries', label: 'Cherries' }
    ];

    protected readonly all = this.items.map((item) => item.value);

    value = signal<string[]>(['apples']);
}
