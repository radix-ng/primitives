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
            rdxNumberFieldRoot
            [defaultValue]="0"
            [format]="format"
            [step]="0.1"
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
                    <svg class="flex" size="16" [lucideIcon]="Minus" />
                </button>
                <input
                    class="text-foreground h-9 w-20 bg-transparent text-center tabular-nums outline-none"
                    rdxNumberFieldInput
                />
                <button
                    class="text-foreground hover:bg-muted flex size-9 items-center justify-center rounded-r-md outline-none select-none disabled:pointer-events-none disabled:opacity-40"
                    rdxNumberFieldIncrement
                >
                    <svg class="flex" size="16" [lucideIcon]="Plus" />
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
