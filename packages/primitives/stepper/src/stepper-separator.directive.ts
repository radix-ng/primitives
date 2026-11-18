import { Directive, effect, inject, input } from '@angular/core';
import { Orientation, RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';
import { injectStepperItemContext } from './stepper-item-context.token';
import { injectStepperRootContext } from './stepper-root-context.token';

@Directive({
    selector: '[rdxStepperSeparator]',
    hostDirectives: [RdxSeparatorRootDirective],
    host: {
        '[attr.data-state]': 'itemContext.itemState()'
    }
})
export class RdxStepperSeparatorDirective {
    protected readonly rootContext = injectStepperRootContext();
    protected readonly itemContext = injectStepperItemContext();

    private readonly rdxSeparator = inject(RdxSeparatorRootDirective, { self: true });

    /** The separator orientation. Defaults to the Stepper orientation. */
    readonly orientation = input<Orientation>();

    constructor() {
        effect(() => {
            this.rdxSeparator.updateOrientation(this.orientation() ?? this.rootContext.orientation());
        });
    }
}
