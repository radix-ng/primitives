import { Directive } from '@angular/core';
import { RdxVisuallyHiddenInputBubbleDirective } from '@radix-ng/primitives/visually-hidden';

@Directive({
    selector: 'input[rdxToggleVisuallyHiddenInput]',
    exportAs: 'rdxToggleVisuallyHiddenInput',
    hostDirectives: [
        {
            directive: RdxVisuallyHiddenInputBubbleDirective,
            inputs: ['name', 'required', 'value', 'disabled']
        }
    ],
    host: {
        type: 'checkbox'
    }
})
export class RdxToggleVisuallyHiddenInputDirective {}
