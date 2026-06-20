import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxButtonDirective } from '../src/checkbox-button';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

/**
 * Template-driven forms: two-way bind the root with `[(ngModel)]`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-ngmodel-example',
    imports: [
        FormsModule,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        LucideCheck
    ],
    template: `
        <div class="flex items-center gap-3">
            <div [(ngModel)]="subscribed" rdxCheckboxRoot>
                <button id="sub" [class]="c.button" rdxCheckboxButton>
                    <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground text-sm font-medium" rdxLabel htmlFor="sub">
                Subscribe to the newsletter
            </label>
        </div>

        <p class="text-muted-foreground mt-3 text-sm">subscribed: {{ subscribed }}</p>
    `
})
export class CheckboxNgModelExample {
    protected readonly c = demoCheckbox;

    subscribed = false;
}
