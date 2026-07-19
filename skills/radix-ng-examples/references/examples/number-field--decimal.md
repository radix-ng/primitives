# Number Field — Decimal

> One example from the [Number Field](../components/number-field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Fractional steps with `signDisplay` and fraction-digit formatting.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    selector: 'number-field-decimal-example',
    imports: [
        LucideDynamicIcon,
        RdxNumberFieldRoot,
        RdxNumberFieldGroup,
        RdxNumberFieldInput,
        RdxNumberFieldIncrement,
        RdxNumberFieldDecrement
    ],
    template: `
        <div
            class="flex flex-col gap-1.5"
            id="decimal"
            [defaultValue]="0"
            [format]="format"
            [step]="0.1"
            rdxNumberFieldRoot
        >
            <label class="text-foreground text-sm font-medium" for="decimal">Decimal</label>
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
                    class="text-foreground h-9 w-20 bg-transparent text-center tabular-nums outline-none"
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
    `
})
export class NumberFieldDecimalExample {
    protected readonly format: Intl.NumberFormatOptions = {
        signDisplay: 'exceptZero',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
    };

    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
```
