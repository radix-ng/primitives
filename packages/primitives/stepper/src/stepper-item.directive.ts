import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, forwardRef, input, numberAttribute } from '@angular/core';
import { STEPPER_ITEM_CONTEXT } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';

@Directive({
    selector: '[rdxStepperItem]',
    providers: [
        {
            provide: STEPPER_ITEM_CONTEXT,
            useExisting: forwardRef(() => RdxStepperItemDirective)
        }
    ],
    host: {
        '[attr.aria-current]': 'itemState() === "active" ? true : undefined',

        '[attr.data-state]': 'itemState()',
        '[attr.disabled]': 'disabled() || !isFocusable() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() || !isFocusable() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()'
    }
})
export class RdxStepperItemDirective {
    protected readonly rootContext = injectStepperRootContext();

    readonly step = input<number, NumberInput>(NaN, { transform: numberAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly completed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly itemState = computed(() => {
        if (this.completed()) return 'completed';
        if (this.rootContext.value() === this.step()) return 'active';

        const step = this.step() ?? 1;
        if (this.rootContext.value()! > step) {
            return 'completed';
        }

        return 'inactive';
    });

    readonly isFocusable = computed(() => {
        if (this.disabled()) return false;

        const step = this.step() ?? 1;
        if (this.rootContext.linear()) {
            return step <= this.rootContext.value()! || step === this.rootContext.value()! + 1;
        }

        return true;
    });
}
