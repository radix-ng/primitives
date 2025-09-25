import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { LucideAngularModule } from 'lucide-angular';
import { RdxCheckboxRootDirective } from '../src/checkbox';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';

@Component({
    selector: 'checkbox-groups-forms-example',
    template: `
        <section [formGroup]="personality">
            <div style="display:flex;align-items:center; padding-bottom: 15px">
                <div rdxCheckboxRoot formControlName="fun">
                    <button class="CheckboxButton" id="r1" rdxCheckboxButton>
                        <lucide-angular class="CheckboxIndicator" rdxCheckboxIndicator size="16" name="check" />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="Label" rdxLabel htmlFor="r1">Fun</label>
            </div>

            <div style="display:flex;align-items:center; padding-bottom: 15px">
                <div rdxCheckboxRoot formControlName="serious">
                    <button class="CheckboxButton" id="r2" rdxCheckboxButton>
                        <lucide-angular class="CheckboxIndicator" rdxCheckboxIndicator size="16" name="check" />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="Label" rdxLabel htmlFor="r2">Serious</label>
            </div>

            <div style="display:flex;align-items:center; padding-bottom: 15px;">
                <div rdxCheckboxRoot formControlName="smart" form="smart">
                    <button class="CheckboxButton" id="r3" rdxCheckboxButton>
                        <lucide-angular class="CheckboxIndicator" rdxCheckboxIndicator size="16" name="check" />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="Label" rdxLabel htmlFor="r3">Smart</label>
            </div>
        </section>

        <section class="Label" [formGroup]="personality">
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
    styleUrl: 'checkbox.css',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        JsonPipe,
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideAngularModule,
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
