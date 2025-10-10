import { Directive, ElementRef, input } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';

@Directive({
    selector: '[rdxTooltipPortal]',
    hostDirectives: [{ directive: RdxPortal, inputs: ['container'] }]
})
export class RdxTooltipPortal {
    readonly container = input<ElementRef<HTMLElement>>();
}
