import { Directive, input } from '@angular/core';
import { RdxPortal, RdxPortalContainer } from '@radix-ng/primitives/portal';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Moves the navigation menu popup to a different part of the DOM (by default `document.body`).
 */
@Directive({
    selector: '[rdxNavigationMenuPortal]',
    hostDirectives: [
        {
            directive: RdxPortal,
            inputs: ['container']
        }
    ],
    host: {
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"'
    }
})
export class RdxNavigationMenuPortal {
    protected readonly rootContext = injectNavigationMenuRootContext()!;

    /**
     * Optional container to portal the popup into. Defaults to `document.body`.
     */
    readonly container = input<RdxPortalContainer>();
}
