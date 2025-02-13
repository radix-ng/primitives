import { Directive } from '@angular/core';
import { injectStepperItemContext } from './stepper-item-context.token';

@Directive({
    selector: '[rdxStepperTitle]',
    host: {
        '[attr.id]': 'itemContext.titleId'
    }
})
export class RdxStepperTitleDirective {
    readonly itemContext = injectStepperItemContext();
}
