import { Directive, ElementRef, input } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';

@Directive({
    selector: '[rdxSelectPortal]',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ]
})
export class RdxSelectPortal {
    readonly container = input.required<ElementRef<HTMLElement>>();
}
