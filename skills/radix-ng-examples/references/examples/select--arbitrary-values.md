# Select — Arbitrary values

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

`RdxSelectRoot<Value, Multiple>` and `RdxSelectItem<Value>` accept an unconstrained Value. Values are
kept intact in Angular models and change events. Equality defaults to `Object.is`; for distinct Date
instances representing the same date, supply a comparator such as `(a, b) => a.getTime() === b.getTime()`.
Empty selections are handled before calling a custom comparator. Falsy values such as `false`, `0`
and `0n` are selectable values.

The `multiple` input defines the selection shape. With `[multiple]="false"`, an array can be **one
item**: its label/value formatter receives the whole array and the native form submits one entry.
With `[multiple]="true"`, the outer array is the selection collection; each selected item produces its
own entry, including when the item itself is an array.

Use `itemToStringLabel` for display and `itemToStringValue` for the strings expected by your form
endpoint. Without a formatter the shared JSON/String fallback applies. The example uses boolean
Reactive Forms, Date Signal Forms, a readonly coordinate array and multiple symbol values, with
native submission and reset.

```typescript
import { Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { RdxFieldLabel, RdxFieldRoot, RdxNgControlField } from '@radix-ng/primitives/field';
import { RdxSignalField } from '@radix-ng/primitives/signal-forms';
import { cn, demoButton } from '../../storybook/styles';
import { SelectTypedControl } from './select-typed-control';

@Component({
    selector: 'select-arbitrary-values',
    imports: [
        SelectTypedControl,
        ReactiveFormsModule,
        FormField,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxNgControlField,
        RdxSignalField
    ],
    template: `
        <form class="grid gap-6" #nativeForm (submit)="submit($event, nativeForm)">
            <div class="grid gap-6 sm:grid-cols-2">
                <div class="grid gap-2" name="enabled" rdxFieldRoot>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Boolean · Reactive Forms</label>
                    <example-select
                        [formControl]="enabled"
                        [options]="booleans"
                        [itemToStringLabel]="booleanLabel"
                        rdxNgControlField
                    />
                    <output
                        class="text-muted-foreground text-xs"
                        [textContent]="enabled.value.toString()"
                        data-testid="boolean-value"
                    ></output>
                </div>
                <div class="grid gap-2" name="date" rdxFieldRoot>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Date · Signal Forms</label>
                    <example-select
                        [formField]="fields.date"
                        [options]="dates"
                        [itemToStringLabel]="dateLabel"
                        [itemToStringValue]="dateLabel"
                        [isItemEqualToValue]="equalDates"
                        rdxSignalField
                    />
                    <output
                        class="text-muted-foreground text-xs"
                        [textContent]="dateLabel(model().date)"
                        data-testid="date-value"
                    ></output>
                </div>
                <div class="grid gap-2" name="coordinates" rdxFieldRoot>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Array · Single value</label>
                    <example-select
                        [(value)]="coordinate"
                        [options]="coordinates"
                        [itemToStringLabel]="coordinateLabel"
                        [itemToStringValue]="coordinateValue"
                    />
                    <output
                        class="text-muted-foreground text-xs"
                        [textContent]="coordinateText()"
                        data-testid="coordinate-value"
                    ></output>
                </div>
                <div class="grid gap-2" name="tokens" rdxFieldRoot>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Symbols · Multiple values</label>
                    <example-select
                        [(value)]="selectedTokens"
                        [options]="tokens"
                        [multiple]="true"
                        [itemToStringLabel]="tokenLabel"
                        [itemToStringValue]="tokenLabel"
                    />
                    <output
                        class="text-muted-foreground text-xs"
                        [textContent]="tokenValues()"
                        data-testid="token-value"
                    ></output>
                </div>
            </div>
            <div class="flex gap-2">
                <button [class]="buttonClass" type="submit">Submit</button>
                <button [class]="buttonClass" type="reset">Reset</button>
            </div>
            <output
                class="text-muted-foreground max-w-xl font-mono text-xs break-all"
                [textContent]="submitted()"
                data-testid="submitted-values"
            ></output>
        </form>
    `
})
export class SelectArbitraryValues {
    protected readonly buttonClass = cn(demoButton.base, demoButton.outline, demoButton.size.sm);
    readonly booleans = [true, false];
    readonly enabled = new FormControl(false, { nonNullable: true });
    readonly dates = [new Date('2026-01-01T00:00:00Z'), new Date('2026-02-01T00:00:00Z')];
    readonly model = signal({ date: this.dates[0] });
    readonly fields = form(this.model);
    readonly coordinates = [
        [10, 20],
        [30, 40]
    ] as const;
    readonly coordinate = signal<readonly number[] | null | undefined>(this.coordinates[0]);
    readonly tokens = [Symbol('primary'), Symbol('secondary')];
    readonly selectedTokens = signal<symbol[] | undefined>([this.tokens[0]]);
    readonly submitted = signal('Not submitted');
    readonly booleanLabel = (value: boolean) => (value ? 'Enabled' : 'Disabled');
    readonly dateLabel = (value: Date) => value.toISOString().slice(0, 10);
    readonly equalDates = (a: Date, b: Date) => a.getTime() === b.getTime();
    readonly coordinateLabel = (value: readonly number[]) => value.join(' × ');
    readonly coordinateValue = (value: readonly number[]) => value.join(':');
    readonly tokenLabel = (value: symbol) => value.description ?? '';
    readonly coordinateText = computed(() => {
        const value = this.coordinate();
        return value == null ? '' : this.coordinateValue(value);
    });
    readonly tokenValues = computed(() => this.selectedTokens()?.map(this.tokenLabel).join(', ') ?? '');

    submit(event: Event, formElement: HTMLFormElement): void {
        event.preventDefault();
        this.submitted.set(JSON.stringify(Array.from(new FormData(formElement).entries())));
    }
}
```
