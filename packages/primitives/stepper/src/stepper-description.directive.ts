import { injectStepperItemContext } from './stepper-item-context.token';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxStepperDescription]',
    host: {
        '[attr.id]': 'itemContext.descriptionId'
    }
})
export class RdxStepperDescriptionDirective {
    readonly itemContext = injectStepperItemContext();
}
