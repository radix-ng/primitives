import { Directive, input } from '@angular/core';
import { RdxPortal, RdxPortalContainer } from '@radix-ng/primitives/portal';

/**
 * Moves the menu to a different part of the DOM.
 * Applied on ng-template — no host bindings (ng-template is not a real DOM node).
 */
@Directive({
    selector: '[rdxMenuPortal]',
    exportAs: 'rdxMenuPortal',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ]
})
export class RdxMenuPortal {
    /**
     * Optional container to portal the content into. Defaults to `document.body`.
     */
    readonly container = input<RdxPortalContainer>();
}
