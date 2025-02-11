import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, forwardRef, inject, input, numberAttribute } from '@angular/core';
import { _IdGenerator } from '@radix-ng/primitives/core';
import { STEPPER_ITEM_CONTEXT, StepperItemContext } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';
import { StepperState } from './types';

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

    readonly titleId = inject(_IdGenerator).getId('rdx-stepper-item-title');

    readonly descriptionId = inject(_IdGenerator).getId('rdx-stepper-item-description');

    readonly step = input<number, NumberInput>(NaN, { transform: numberAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly completed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly itemState = computed<StepperState>(() => {
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
