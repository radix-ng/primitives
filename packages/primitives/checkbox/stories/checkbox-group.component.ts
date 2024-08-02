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
                <label
                    class="Label"
                    LabelRoot
                    htmlFor="r1"
                >
                    <button
                        class="CheckboxRoot"
                        CheckboxRoot
                        formControlName="fun"
                    >
                        <lucide-angular
                            class="CheckboxIndicator"
                            CheckboxIndicator
                            size="16"
                            name="check"
                        ></lucide-angular>
                        <input
                            class="Input cdk-visually-hidden"
                            id="r1"
                            CheckboxInput
                        />
                    </button>
                    Fun
                </label>
            </p>
            <p>
                <label
                    class="Label"
                    LabelRoot
                    htmlFor="r2"
                >
                    <button
                        class="CheckboxRoot rt-BaseCheckboxRoot rt-CheckboxRoot"
                        CheckboxRoot
                        formControlName="serious"
                    >
                        <lucide-angular
                            class="CheckboxIndicator"
                            CheckboxIndicator
                            size="16"
                            name="check"
                        ></lucide-angular>
                        <input
                            class="Input cdk-visually-hidden"
                            id="r2"
                            CheckboxInput
                        />
                    </button>
                    Serious
                </label>
            </p>
            <p>
                <label
                    class="Label"
                    LabelRoot
                    htmlFor="r3"
                >
                    <button
                        class="CheckboxRoot"
                        CheckboxRoot
                        formControlName="smart"
                    >
                        <lucide-angular
                            class="CheckboxIndicator"
                            CheckboxIndicator
                            size="16"
                            name="check"
                        ></lucide-angular>
                        <input
                            class="Input cdk-visually-hidden"
                            id="r3"
                            CheckboxInput
                        />
                    </button>
                    Smart
                </label>
            </p>
        </section>
        <section
            class="Label"
            [formGroup]="personality"
        >
            <h4>You chose:&nbsp;</h4>
            {{ personality.value | json }}
        </section>

        <button
            class="rt-reset rt-BaseButton rt-r-size-2 rt-variant-solid rt-Button"
            (click)="toggleDisable()"
            data-accent-color="cyan"
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
