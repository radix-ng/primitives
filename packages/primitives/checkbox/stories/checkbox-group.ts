import { Component, signal } from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxGroupDirective } from '../src/checkbox-group';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

/**
 * `rdxCheckboxGroup` holds the array of checked names. Each child participates by its `name`, and
 * the checkbox marked `parent` becomes a "select all" whose state (checked / indeterminate /
 * unchecked) is derived from `allValues` — no manual wiring.
 *
 * Try the parent from a partial selection: it cycles partial → all → none → back to your partial
 * selection, instead of a flat all/none toggle.
 */
@Component({
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
                    <button id="all" [class]="c.button" rdxCheckboxButton>
                        <svg
                            [class]="c.indicator"
                            [lucideIcon]="group.parentState() === 'indeterminate' ? 'minus' : 'check'"
                            rdxCheckboxIndicator
                            size="16"
                        />
                    </button>
                </div>
                <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="all">Select all</label>
            </div>

            <div class="ml-6 flex flex-col gap-3">
                @for (item of items; track item.name) {
                    <div class="flex items-center gap-3">
                        <div [name]="item.name" rdxCheckboxRoot>
                            <button [class]="c.button" [id]="item.name" rdxCheckboxButton>
                                <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                            </button>
                        </div>
                        <label class="text-foreground text-sm font-medium" [htmlFor]="item.name" rdxLabel>
                            {{ item.label }}
                        </label>
                    </div>
                }
            </div>
        </div>
    `
})
export class CheckboxGroupExample {
    protected readonly c = demoCheckbox;

    protected readonly items = [
        { name: 'apples', label: 'Apples' },
        { name: 'bananas', label: 'Bananas' },
        { name: 'cherries', label: 'Cherries' }
    ];

    protected readonly all = this.items.map((item) => item.name);

    value = signal<string[]>(['apples']);
}
