import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixCheck } from '@ng-icons/radix-icons';
import { RdxLabelRootDirective } from '@radix-ng/primitives/label';

import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { RdxCheckboxDirective } from '../src/checkbox.directive';

@Component({
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <p>
                <label LabelRoot class="Label" htmlFor="r1">
                    <button class="CheckboxRoot" rdxCheckbox formControlName="fun">
                        <ng-icon
                            rdxCheckboxIndicator
                            class="CheckboxIndicator"
                            name="radixCheck"
                        ></ng-icon>
                        <input
                            rdxCheckboxIndicator
                            type="checkbox"
                            id="r1"
                            aria-hidden="true"
                            tabindex="-1"
                            class="Input"
                        />
                    </button>
                    Fun
                </label>
            </p>
            <p>
                <label LabelRoot class="Label" htmlFor="r2">
                    <button class="CheckboxRoot" rdxCheckbox formControlName="serious">
                        <ng-icon
                            rdxCheckboxIndicator
                            class="CheckboxIndicator"
                            name="radixCheck"
                        ></ng-icon>
                        <input
                            rdxCheckboxIndicator
                            id="r2"
                            type="checkbox"
                            aria-hidden="true"
                            tabindex="-1"
                            class="Input"
                        />
                    </button>
                    Serious
                </label>
            </p>
            <p>
                <label LabelRoot class="Label" htmlFor="r3">
                    <button class="CheckboxRoot" rdxCheckbox formControlName="smart">
                        <ng-icon
                            rdxCheckboxIndicator
                            class="CheckboxIndicator"
                            name="radixCheck"
                        ></ng-icon>
                        <input
                            rdxCheckboxIndicator
                            id="r3"
                            type="checkbox"
                            aria-hidden="true"
                            tabindex="-1"
                            class="Input"
                        />
                    </button>
                    Smart
                </label>
            </p>
        </section>
        <section class="Label" [formGroup]="personality">
            <h4>You chose:</h4>
            {{ personality.value | json }}
        </section>

        <button
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
        NgIconComponent
    ],
    providers: [provideIcons({ radixCheck })]
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
