import { Directive } from '@angular/core';
import { injectStepperItemContext } from './stepper-item-context.token';

@Directive({
    selector: '[rdxStepperDescription]',
    host: {
        '[attr.id]': 'itemContext.descriptionId'
    }
})
export class RdxStepperDescriptionDirective {
    readonly itemContext = injectStepperItemContext();
}
