import { injectStepperItemContext } from './stepper-item-context.token';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxStepperIndicator]',
    exportAs: 'rdxStepperIndicator'
})
export class RdxStepperIndicatorDirective {
    readonly itemContext = injectStepperItemContext();
}
