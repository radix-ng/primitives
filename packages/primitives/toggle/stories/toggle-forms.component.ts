import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RdxToggleVisuallyHiddenInputDirective } from '../src/toggle-visually-hidden-input.directive';
import { RdxToggleDirective } from '../src/toggle.directive';

@Component({
    selector: 'toggle-reactive-forms',
    imports: [ReactiveFormsModule, RdxToggleDirective, RdxToggleVisuallyHiddenInputDirective],
    template: `
        <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                #toggle="rdxToggle"
                formControlName="pressed"
                rdxToggle
                aria-label="Toggle bold"
            >
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

            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 mt-2 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-medium shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                type="submit"
            >
                Submit
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

    onSubmit(): void {
        console.log(this.formGroup.value);
    }
}
