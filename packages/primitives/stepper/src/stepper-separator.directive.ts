import { Directive } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';
import { injectStepperItemContext } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';

@Directive({
    selector: '[rdxStepperSeparator]',
    hostDirectives: [{ directive: RdxSeparatorRootDirective, inputs: ['orientation', 'decorative'] }]
})
export class RdxStepperSeparatorDirective {
    protected readonly rootContext = injectStepperRootContext();
    protected readonly itemContext = injectStepperItemContext();
}
