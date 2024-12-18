import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInputDirective } from '../src/switch-input.directive';
import { RdxSwitchRootDirective } from '../src/switch-root.directive';
import { RdxSwitchThumbDirective } from '../src/switch-thumb.directive';

@Component({
    selector: 'switch-reactive-forms',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RdxLabelDirective,
        RdxSwitchRootDirective,
        RdxSwitchInputDirective,
        RdxSwitchThumbDirective
    ],
    styleUrl: './switch.styles.css',
    template: `
        <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <label class="Label" rdxLabel htmlFor="airplane-mode-form">
                Airplane mode
                <button class="SwitchRoot" id="airplane-mode-form" formControlName="policy" rdxSwitchRoot>
                    <input rdxSwitchInput />
                    <span class="SwitchThumb" rdxSwitchThumb></span>
                </button>
            </label>
            <button class="Button violet" style="margin-top: 8px;" type="submit">Submit</button>
        </form>
        <p>
            <button class="Button violet" (click)="setValue()">Set preset value</button>
        </p>
    `
})
export class SwitchReactiveForms implements OnInit {
    formGroup!: FormGroup;

    ngOnInit() {
        this.formGroup = new FormGroup({
            policy: new FormControl<boolean>(true)
        });
    }

    onSubmit(): void {
        console.log(this.formGroup.value);
    }

    setValue() {
        this.formGroup.setValue({ policy: false });
    }
}
