# Number Field — Reactive Forms

> One example from the [Number Field](../components/number-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

The control integrates with `formControlName`, exposing the numeric value to the form.

```typescript
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideDynamicIcon, LucideMinus as Minus, LucidePlus as Plus } from '@lucide/angular';
import {
    RdxNumberFieldDecrement,
    RdxNumberFieldGroup,
    RdxNumberFieldIncrement,
    RdxNumberFieldInput,
    RdxNumberFieldRoot
} from '@radix-ng/primitives/number-field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'number-field-reactive-forms',
    imports: [
        ReactiveFormsModule,
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <form class="space-y-3" [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <div
                class="flex flex-col gap-1.5"
                id="guests"
                [min]="1"
                [max]="9"
                name="guests"
                formControlName="guests"
                rdxNumberFieldRoot
            >
                <label class="text-foreground text-sm font-medium" for="guests">Guests</label>
                <div
                    class="border-border bg-background focus-within:ring-ring flex h-9 w-fit items-center rounded-md border shadow-sm focus-within:ring-2"
                    rdxNumberFieldGroup
                >
                    <button
                        class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-l-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                        rdxNumberFieldDecrement
                    >
                        <svg class="flex" [lucideIcon]="Minus" size="16" />
                    </button>
                    <input
                        class="text-foreground h-9 w-16 bg-transparent text-center tabular-nums outline-none"
                        rdxNumberFieldInput
                    />
                    <button
                        class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                        rdxNumberFieldIncrement
                    >
                        <svg class="flex" [lucideIcon]="Plus" size="16" />
                    </button>
                </div>
            </div>
            <button
                class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                type="submit"
            >
                Submit
            </button>
        </form>
        <p class="text-muted-foreground mt-3 text-sm">Value: {{ formGroup.value.guests }}</p>
    `
})
export class NumberFieldReactiveForms implements OnInit {
    formGroup!: FormGroup;

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;

    ngOnInit() {
        this.formGroup = new FormGroup({
            guests: new FormControl<number | null>(2)
        });
    }

    onSubmit(): void {
        console.log(this.formGroup.value);
    }
}
```
