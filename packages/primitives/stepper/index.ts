import { NgModule } from '@angular/core';
import { RdxStepperDescriptionDirective } from './src/stepper-description.directive';
import { RdxStepperIndicatorDirective } from './src/stepper-indicator.directive';
import { RdxStepperItemDirective } from './src/stepper-item.directive';
import { RdxStepperRootDirective } from './src/stepper-root.directive';
import { RdxStepperSeparatorDirective } from './src/stepper-separator.directive';
import { RdxStepperTitleDirective } from './src/stepper-title.directive';
import { RdxStepperTriggerDirective } from './src/stepper-trigger.directive';

export * from './src/stepper-description.directive';
export * from './src/stepper-indicator.directive';
export * from './src/stepper-item.directive';
export * from './src/stepper-root-context.token';
export * from './src/stepper-root.directive';
export * from './src/stepper-separator.directive';
export * from './src/stepper-title.directive';
export * from './src/stepper-trigger.directive';
export * from './src/types';

const _imports = [
    RdxStepperDescriptionDirective,
    RdxStepperTitleDirective,
    RdxStepperSeparatorDirective,
    RdxStepperItemDirective,
    RdxStepperIndicatorDirective,
    RdxStepperRootDirective,
    RdxStepperTriggerDirective
];

@NgModule({
    imports: [..._imports],
    exports: [..._imports]
})
export class RdxStepperModule {}
