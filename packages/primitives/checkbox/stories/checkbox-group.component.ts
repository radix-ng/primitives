import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { LabelDirective } from '@radix-ng/primitives/label';
import { CheckboxDirective } from '../src/checkbox.directive';
import { CheckboxIndicatorDirective } from '../src/checkbox-indicator.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { radixCheck } from '@ng-icons/radix-icons';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <p>
                <label rdxLabel class="Label">
                    <button class="CheckboxRoot" rdxCheckbox formControlName="fun">
                        <ng-icon
                            rdxCheckboxIndicator
                            class="CheckboxIndicator"
                            name="radixCheck"
                        ></ng-icon>
                        <input
                            rdxCheckboxIndicator
                            type="checkbox"
                            aria-hidden="true"
                            tabindex="-1"
                            class="Input"
                        />
                    </button>
                    Fun
                </label>
            </p>
            <p>
                <label rdxLabel class="Label">
                    <button class="CheckboxRoot" rdxCheckbox formControlName="serious">
                        <ng-icon
                            rdxCheckboxIndicator
                            class="CheckboxIndicator"
                            name="radixCheck"
                        ></ng-icon>
                        <input
                            rdxCheckboxIndicator
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
                <label rdxLabel class="Label">
                    <button class="CheckboxRoot" rdxCheckbox formControlName="smart">
                        <ng-icon
                            rdxCheckboxIndicator
                            class="CheckboxIndicator"
                            name="radixCheck"
                        ></ng-icon>
                        <input
                            rdxCheckboxIndicator
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
        LabelDirective,
        CheckboxDirective,
        CheckboxIndicatorDirective,
        NgIconComponent
    ],
    providers: [provideIcons({ radixCheck })]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CheckboxReactiveFormsExample {
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
