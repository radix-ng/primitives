import { injectStepperItemContext } from './stepper-item-context.token';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxStepperTitle]',
    host: {
        '[attr.id]': 'itemContext.titleId'
    }
})
export class RdxStepperTitleDirective {
    readonly itemContext = injectStepperItemContext();
}
