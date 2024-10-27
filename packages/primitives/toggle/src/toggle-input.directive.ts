import { Directive } from '@angular/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';

@Directive({
    selector: '[rdxToggleInput]',
    exportAs: 'rdxToggleInput',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxVisuallyHiddenInputDirective,
            inputs: [
                'name',
                'required'
            ]
        }
    ],
    host: {
        type: 'checkbox'
    }
})
export class RdxToggleInputDirective {}
