import { Directive, input } from '@angular/core';
import { RdxPortal, RdxPortalContainer } from '@radix-ng/primitives/portal';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * Moves the preview-card to a different part of the DOM.
 */
@Directive({
    selector: '[rdxPreviewCardPortal]',
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
export class RdxPreviewCardPortal {
    protected readonly rootContext = injectRdxPreviewCardRootContext()!;

    /**
     * Optional container to portal the content into. Defaults to `document.body`.
     */
    readonly container = input<RdxPortalContainer>();
}
