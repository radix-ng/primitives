import { Directive } from '@angular/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Directive({
    selector: 'input[rdxToggleVisuallyHiddenInput]',
    exportAs: 'rdxToggleVisuallyHiddenInput',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxVisuallyHiddenInputDirective,
            inputs: [
                'name',
                'required',
                'value',
                'disabled'
            ]
        }
    ],
    host: {
        type: 'checkbox'
    }
})
export class RdxToggleVisuallyHiddenInputDirective {}
