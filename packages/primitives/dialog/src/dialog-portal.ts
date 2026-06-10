import { Directive, input } from '@angular/core';
import { RdxPortal, RdxPortalContainer } from '@radix-ng/primitives/portal';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * Moves the dialog to a different part of the DOM.
 */
@Directive({
    selector: '[rdxDialogPortal]',
    exportAs: 'rdxDialogPortal',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ],
    host: {
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"'
    }
})
export class RdxDialogPortal {
    protected readonly rootContext = injectRdxDialogRootContext();

    /**
     * Optional container to portal the content into. Defaults to `document.body`.
     */
    readonly container = input<RdxPortalContainer>();
}
