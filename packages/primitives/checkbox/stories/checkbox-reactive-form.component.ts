import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { Check, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'checkbox-reactive-forms',
    imports: [
        FormsModule,
        LucideAngularModule,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        RdxCheckboxRootDirective,
        RdxLabelDirective,
        ReactiveFormsModule
    ],
    styleUrl: 'checkbox-group.styles.scss',
    template: `
        <form [formGroup]="formGroup">
            <label class="Label form--label" rdxLabel htmlFor="r1">
                <button class="CheckboxRoot" rdxCheckboxRoot formControlName="checkbox">
                    <lucide-angular class="CheckboxIndicator" [img]="Check" rdxCheckboxIndicator size="16" />
                    <input class="Input" id="r1" rdxCheckboxInput />
                </button>
                Checkbox in a reactive form
            </label>
            <label class="Label form--label" rdxLabel htmlFor="r2">
                <button
                    class="CheckboxRoot rt-BaseCheckboxRoot rt-CheckboxRoot"
                    rdxCheckboxRoot
                    formControlName="disabledCheckbox"
                >
                    <lucide-angular class="CheckboxIndicator" [img]="Check" rdxCheckboxIndicator size="16" />
                    <input class="Input" id="r2" rdxCheckboxInput />
                </button>
                Disabled checkbox in a reactive form
            </label>
        </form>
        <button (click)="toggleDisable()">Toggle disabled state</button>
    `
})
export class CheckboxReactiveForm implements OnInit {
    private readonly formBuilder = inject(FormBuilder);

    formGroup: FormGroup;

    ngOnInit() {
        this.formGroup = this.formBuilder.group({
            checkbox: this.formBuilder.control(false),
            disabledCheckbox: this.formBuilder.control({ value: true, disabled: true })
        });
    }

    toggleDisable() {
        const checkbox = this.formGroup.get('checkbox');
        if (checkbox != null) {
            checkbox.disabled ? checkbox.enable() : checkbox.disable();
        }
    }

    protected readonly Check = Check;
}
