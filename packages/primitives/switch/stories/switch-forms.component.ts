import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxSwitchInputDirective } from '../src/switch-input.directive';
import { RdxSwitchRootDirective } from '../src/switch-root.directive';
import { RdxSwitchThumbDirective } from '../src/switch-thumb.directive';

@Component({
    selector: 'switch-reactive-forms',
    imports: [
        ReactiveFormsModule,
        RdxLabelDirective,
        RdxSwitchRootDirective,
        RdxSwitchInputDirective,
        RdxSwitchThumbDirective
    ],
    template: `
        <form class="space-y-3" [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <label
                class="text-foreground flex items-center gap-3 text-sm font-medium"
                rdxLabel
                htmlFor="airplane-mode-form"
            >
                Airplane mode
                <button
                    class="bg-muted data-[state=checked]:bg-primary focus-visible:ring-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-0 p-0 shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="airplane-mode-form"
                    formControlName="policy"
                    rdxSwitchRoot
                >
                    <input rdxSwitchInput />
                    <span
                        class="bg-background pointer-events-none block size-5 translate-x-0.5 rounded-full shadow-sm transition-transform data-[state=checked]:translate-x-[22px]"
                        rdxSwitchThumb
                    ></span>
                </button>
            </label>
            <button
                class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                type="submit"
            >
                Submit
            </button>
        </form>
        <p class="mt-3">
            <button
                class="border-border bg-background text-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                (click)="setValue()"
                type="button"
            >
                Set preset value
            </button>
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
