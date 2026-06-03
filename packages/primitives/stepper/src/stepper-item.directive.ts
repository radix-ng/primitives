import { STEPPER_ITEM_CONTEXT, StepperItemContext } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';
import { StepperState } from './types';
import { booleanAttribute, computed, Directive, forwardRef, input, numberAttribute } from '@angular/core';
import { BooleanInput, injectId, NumberInput } from '@radix-ng/primitives/core';

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
export class RdxStepperItemDirective implements StepperItemContext {
    protected readonly rootContext = injectStepperRootContext();

    /** @ignore */
    readonly titleId = injectId('rdx-stepper-item-title');

    /** @ignore */
    readonly descriptionId = injectId('rdx-stepper-item-description');

    readonly step = input<number, NumberInput>(NaN, { transform: numberAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore */
    readonly completed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore */
    readonly itemState = computed<StepperState>(() => {
        if (this.completed()) return 'completed';
        if (this.rootContext.value() === this.step()) return 'active';

        const step = this.step() ?? 1;
        if (this.rootContext.value()! > step) {
            return 'completed';
        }

        return 'inactive';
    });

    /** @ignore */
    readonly isFocusable = computed(() => {
        if (this.disabled()) return false;

        const step = this.step() ?? 1;
        if (this.rootContext.linear()) {
            return step <= this.rootContext.value()! || step === this.rootContext.value()! + 1;
        }

        return true;
    });
}
