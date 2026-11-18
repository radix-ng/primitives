import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="fun">
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="r1"
                        rdxCheckboxButton
                    >
                        <svg class="text-primary flex items-center" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">Fun</label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="serious">
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="r2"
                        rdxCheckboxButton
                    >
                        <svg class="text-primary flex items-center" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r2">
                    Serious
                </label>
            </div>

            <div class="flex items-center gap-3 pb-3">
                <div rdxCheckboxRoot formControlName="smart" form="smart">
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="r3"
                        rdxCheckboxButton
                    >
                        <svg class="text-primary flex items-center" rdxCheckboxIndicator size="16" lucideCheck />
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

        <button class="demo-button demo-button-primary h-9 px-4" (click)="toggleDisable()" type="button">
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
