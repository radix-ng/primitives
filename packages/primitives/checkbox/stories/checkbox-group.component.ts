import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RdxLabelRootDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';

import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { RdxCheckboxInputDirective } from '../src/checkbox-input.directive';
import { RdxCheckboxDirective } from '../src/checkbox.directive';

@Component({
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <p>
                <label LabelRoot class="Label" htmlFor="r1">
                    <button CheckboxRoot class="CheckboxRoot" formControlName="fun">
                        <lucide-angular
                            CheckboxIndicator
                            class="CheckboxIndicator"
                            size="16"
                            name="check"
                        ></lucide-angular>
                        <input CheckboxInput id="r1" class="Input cdk-visually-hidden" />
                    </button>
                    Fun
                </label>
            </p>
            <p>
                <label LabelRoot class="Label" htmlFor="r2">
                    <button
                        CheckboxRoot
                        class="CheckboxRoot rt-BaseCheckboxRoot rt-CheckboxRoot"
                        formControlName="serious"
                    >
                        <lucide-angular
                            CheckboxIndicator
                            class="CheckboxIndicator"
                            size="16"
                            name="check"
                        ></lucide-angular>
                        <input CheckboxInput id="r2" class="Input cdk-visually-hidden" />
                    </button>
                    Serious
                </label>
            </p>
            <p>
                <label LabelRoot class="Label" htmlFor="r3">
                    <button CheckboxRoot class="CheckboxRoot" formControlName="smart">
                        <lucide-angular
                            CheckboxIndicator
                            class="CheckboxIndicator"
                            size="16"
                            name="check"
                        ></lucide-angular>
                        <input CheckboxInput id="r3" class="Input cdk-visually-hidden" />
                    </button>
                    Smart
                </label>
            </p>
        </section>
        <section class="Label" [formGroup]="personality">
            <h4>You chose:&nbsp;</h4>
            {{ personality.value | json }}
        </section>

        <button
            data-accent-color="cyan"
            class="rt-reset rt-BaseButton rt-r-size-2 rt-variant-solid rt-Button"
            (click)="toggleDisable()"
        >
            Toggle disabled state
        </button>
    `,
    styleUrl: 'checkbox-group.styles.scss',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        JsonPipe,
        RdxLabelRootDirective,
        RdxCheckboxDirective,
        RdxCheckboxIndicatorDirective,
        LucideAngularModule,
        RdxCheckboxInputDirective
    ]
})
export class CheckboxReactiveFormsExampleComponent {
    personality = this.formBuilder.group({
        fun: false,
        serious: false,
        smart: false
    });

    constructor(protected formBuilder: FormBuilder) {}

    toggleDisable() {
        const checkbox = this.personality.get('serious');
        if (checkbox != null) {
            checkbox.disabled ? checkbox.enable() : checkbox.disable();
        }
    }
}
