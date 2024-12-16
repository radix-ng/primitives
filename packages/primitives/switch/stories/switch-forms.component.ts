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
        <form [formGroup]="formGroup">
            <label class="Label" rdxLabel htmlFor="airplane-mode-form">
                Airplane mode
                <button class="SwitchRoot" id="airplane-mode-form" formControlName="checked" rdxSwitchRoot>
                    <input rdxSwitchInput />
                    <span class="SwitchThumb" rdxSwitchThumb></span>
                </button>
            </label>
        </form>
    `
})
export class SwitchReactiveForms implements OnInit {
    formGroup!: FormGroup;

    ngOnInit() {
        this.formGroup = new FormGroup({
            checked: new FormControl<boolean>(true)
        });
    }
}
