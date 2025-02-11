import { inject, InjectionToken } from '@angular/core';

export interface StepperRootContext {
    value: any;
    orientation: any;
    dir: any;
    linear: any;
    totalStepperItems: any;
}

export const STEPPER_ROOT_CONTEXT = new InjectionToken<StepperRootContext>('StepperRootContext');

export function injectStepperRootContext(): StepperRootContext {
    return inject(STEPPER_ROOT_CONTEXT);
}
