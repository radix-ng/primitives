# Switch — Reactive Forms

> One example from the [Switch](../components/switch.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Bind the switch to a form control via `formControlName`.

```typescript
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RdxSwitchRoot, RdxSwitchThumb } from '@radix-ng/primitives/switch';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'switch-reactive-forms',
    imports: [ReactiveFormsModule, RdxSwitchRoot, RdxSwitchThumb],
    template: `
        <form class="space-y-3" [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <label class="text-foreground flex items-center gap-2 text-sm" for="airplane-mode-form">
                Airplane mode
                <button
                    class="demo-switch h-5 w-9 p-0.5"
                    id="airplane-mode-form"
                    formControlName="policy"
                    rdxSwitchRoot
                >
                    <span
                        class="demo-switch-thumb size-3.5 data-checked:translate-x-4 rtl:data-checked:-translate-x-4"
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
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)
