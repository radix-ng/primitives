import { StepperState } from './types';
import { inject, InjectionToken, InputSignalWithTransform, Signal } from '@angular/core';
import { BooleanInput, NumberInput } from '@radix-ng/primitives/core';

export interface StepperItemContext {
    titleId: string;
    descriptionId: string;
    step: InputSignalWithTransform<number, NumberInput>;
    disabled: InputSignalWithTransform<boolean, BooleanInput>;
    isFocusable: Signal<boolean>;
    itemState: Signal<StepperState>;
}

export const STEPPER_ITEM_CONTEXT = new InjectionToken<StepperItemContext>('StepperItemContext');

export function injectStepperItemContext(): StepperItemContext {
    return inject(STEPPER_ITEM_CONTEXT);
}
