import { Directive } from '@angular/core';
import { injectStepperItemContext } from './stepper-item-context.token';

@Directive({
    selector: '[rdxStepperIndicator]',
    exportAs: 'rdxStepperIndicator'
})
export class RdxStepperIndicatorDirective {
    readonly itemContext = injectStepperItemContext();
}
