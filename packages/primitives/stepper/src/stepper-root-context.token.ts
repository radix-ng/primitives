import { Direction } from '@angular/cdk/bidi';
import {
    inject,
    InjectionToken,
    InputSignal,
    InputSignalWithTransform,
    ModelSignal,
    WritableSignal
} from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';

export interface StepperRootContext {
    value: ModelSignal<number | undefined>;
    orientation: InputSignal<'vertical' | 'horizontal'>;
    dir: InputSignal<Direction>;
    linear: InputSignalWithTransform<boolean, BooleanInput>;
    totalStepperItems: WritableSignal<HTMLElement[]>;
}

export const STEPPER_ROOT_CONTEXT = new InjectionToken<StepperRootContext>('StepperRootContext');

export function injectStepperRootContext(): StepperRootContext {
    return inject(STEPPER_ROOT_CONTEXT);
}
