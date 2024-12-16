import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RdxToggleVisuallyHiddenInputDirective } from '../src/toggle-visually-hidden-input.directive';
import { RdxToggleDirective } from '../src/toggle.directive';

@Component({
    selector: 'toggle-reactive-forms',
    standalone: true,
    imports: [ReactiveFormsModule, RdxToggleDirective, RdxToggleVisuallyHiddenInputDirective],
    styleUrl: 'toggle.styles.css',
    template: `
        <form [formGroup]="formGroup">
            <button class="Toggle" #toggle="rdxToggle" formControlName="pressed" rdxToggle aria-label="Toggle bold">
                <input
                    [name]="'toggleDef'"
                    [value]="toggle.pressed() ? 'on' : 'off'"
                    [required]="false"
                    rdxToggleVisuallyHiddenInput
                />
                @if (toggle.pressed()) {
                    On
                } @else {
                    Off
                }
            </button>
        </form>
    `
})
export class ToggleButtonReactiveForms implements OnInit {
    formGroup!: FormGroup;

    ngOnInit() {
        this.formGroup = new FormGroup({
            pressed: new FormControl<boolean>(true)
        });
    }
}
