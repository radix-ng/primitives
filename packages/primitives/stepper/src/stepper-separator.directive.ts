import { Directive, effect, inject } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';
import { injectStepperItemContext } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';

@Directive({
    selector: '[rdxStepperSeparator]',
    hostDirectives: [{ directive: RdxSeparatorRootDirective, inputs: ['orientation', 'decorative'] }],
    host: {
        '[attr.data-state]': 'itemContext.itemState()'
    }
})
export class RdxStepperSeparatorDirective {
    protected readonly rootContext = injectStepperRootContext();
    protected readonly itemContext = injectStepperItemContext();

    private readonly rdxSeparator = inject(RdxSeparatorRootDirective, { host: true });

    constructor() {
        effect(() => {
            this.rdxSeparator.updateDecorative(true);
            this.rdxSeparator.updateOrientation(this.rootContext.orientation());
        });
    }
}
