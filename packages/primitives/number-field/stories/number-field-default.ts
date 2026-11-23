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
    selector: 'number-field-default-example',
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
            class="flex flex-col items-start gap-1"
            [id]="'quantity'"
            [defaultValue]="100"
            [min]="0"
            rdxNumberFieldRoot
        >
            <label class="text-foreground text-sm font-bold" for="quantity">Quantity</label>
            <div class="flex h-8" rdxNumberFieldGroup>
                <button class="demo-button demo-button-outline size-8 border-e-0" rdxNumberFieldDecrement>
                    <svg class="flex" [lucideIcon]="Minus" size="16" />
                </button>
                <input class="demo-input h-full w-[7ch] px-2 text-start tabular-nums focus:z-1" rdxNumberFieldInput />
                <button class="demo-button demo-button-outline size-8 border-s-0" rdxNumberFieldIncrement>
                    <svg class="flex" [lucideIcon]="Plus" size="16" />
                </button>
            </div>
        </div>
    `
})
export class NumberFieldDefaultExample {
    protected readonly Minus = Minus;
    protected readonly Plus = Plus;
}
