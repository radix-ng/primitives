# Checkbox — Validation

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

`Validators.requiredTrue` enforces acceptance; the error shows once the field is touched and submit is guarded.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxIndicatorPresenceDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';

/**
 * Reactive forms with validation: `Validators.requiredTrue` forces the box to be
 * ticked, the error shows after the field is touched, and submit is guarded.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-validation-example',
    imports: [
        ReactiveFormsModule,

        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxIndicatorPresenceDirective,
        RdxCheckboxInputDirective,
        LucideCheck
    ],
    template: `
        <form class="flex flex-col gap-3" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="flex items-center gap-3">
                <div rdxCheckboxRoot formControlName="terms">
                    <button
                        class="demo-checkbox-button demo-focus flex size-6 items-center justify-center disabled:opacity-50 aria-disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        id="terms"
                        rdxCheckboxButton
                    >
                        <svg
                            class="text-primary flex items-center"
                            *rdxCheckboxIndicatorPresence
                            rdxCheckboxIndicator
                            size="16"
                            lucideCheck
                        />
                    </button>
                    <input rdxCheckboxInput />
                </div>
                <label class="text-foreground text-sm font-medium" for="terms">I accept the terms and conditions</label>
            </div>

            @if (form.controls.terms.invalid && form.controls.terms.touched) {
                <p class="text-destructive text-sm">You must accept the terms to continue.</p>
            }

            <button class="demo-button demo-button-primary h-9 self-start px-4" type="submit">Submit</button>

            @if (submitted()) {
                <p class="text-muted-foreground text-sm">Submitted ✓</p>
            }
        </form>
    `
})
export class CheckboxValidationExample {
    private readonly formBuilder = inject(FormBuilder);

    readonly form = this.formBuilder.group({
        terms: this.formBuilder.control(false, Validators.requiredTrue)
    });

    readonly submitted = signal(false);

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.controls.terms.markAsTouched();
            return;
        }
        this.submitted.set(true);
    }
}
```

There are two ways to build a "select all" parent. Pick by how much you want to own:

|                                  | **Select all** (below)                | **Checkbox group**                                                  |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| Source of truth                  | your own model (one boolean per item) | the group's `string[]` value (the checked child values)            |
| Parent / indeterminate logic     | written by hand in the component      | built in (`parent` + `allValues`)                                   |
| Parent click                     | flat toggle: all ↔ none               | remembers the partial selection: partial → all → none → partial     |
| Disabled child during select-all | you handle it                         | preserved automatically                                             |
| Forms integration                | wire each control yourself            | the group is one control (`[(value)]` / `ngModel` / reactive forms) |

Reach for **Select all** when you already manage the items yourself and just need the derived parent
state. Reach for the **Checkbox group** when you want the array value and the Base UI parent behavior
for free.

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
