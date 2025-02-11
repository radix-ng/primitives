import { inject, InjectionToken } from '@angular/core';

export interface StepperItemContext {
    step: any;
    disabled: any;
    itemState: any;
    isFocusable: any;
}

export const STEPPER_ITEM_CONTEXT = new InjectionToken<StepperItemContext>('StepperItemContext');

export function injectStepperItemContext(): StepperItemContext {
    return inject(STEPPER_ITEM_CONTEXT);
}
