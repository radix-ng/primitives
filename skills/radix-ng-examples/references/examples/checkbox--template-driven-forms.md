# Checkbox — Template-driven forms

> One example from the [Checkbox](../components/checkbox.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Two-way bind the root with `[(ngModel)]`.

```typescript
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
```
