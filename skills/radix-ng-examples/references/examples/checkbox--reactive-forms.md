# Checkbox — Reactive forms

> One example from the [Checkbox](../components/checkbox.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

Bind the root with `formControlName`; `disabled` reacts to the control's enable/disable state.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { cn, demoButton, demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="fun">
                    <button id="r1" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">Fun</label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="serious">
                    <button id="r2" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r2">
                    Serious
                </label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="smart" form="smart">
                    <button id="r3" [class]="c.button" rdxCheckboxButton>
                        <svg [class]="c.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r3">Smart</label>
            </div>
        </section>

        <section class="text-muted-foreground mb-3 flex items-center text-sm" [formGroup]="personality">
            <h4 class="font-medium">You chose:&nbsp;</h4>
            {{ personality.value | json }}
        </section>

        <button [class]="cn(b.base, b.primary, b.size.md)" (click)="toggleDisable()" type="button">
            Toggle disabled state
        </button>
    `,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        JsonPipe,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideCheck,
        RdxCheckboxInputDirective
    ]
})
export class CheckboxReactiveFormsExampleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCheckbox;

    private readonly formBuilder = inject(FormBuilder);

    personality = this.formBuilder.group({
        fun: false,
        serious: false,
        smart: false
    });

    toggleDisable() {
        const checkbox = this.personality.get('serious');
        if (checkbox != null) {
            checkbox.disabled ? checkbox.enable() : checkbox.disable();
        }
    }
}
```
