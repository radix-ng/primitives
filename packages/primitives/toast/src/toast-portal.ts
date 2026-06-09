import { Directive } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';

/**
 * Moves the toast viewport to a different part of the DOM — the Angular counterpart of
 * `<Toast.Portal>`. Defaults to `document.body`; pass `container` to target another element.
 */
@Directive({
    selector: '[rdxToastPortal]',
    exportAs: 'rdxToastPortal',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ]
})
export class RdxToastPortal {}
