import { Directive } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';
import { injectCollapsibleRootContext } from './collapsible-root.directive';

/**
 * Structural directive that mounts the collapsible panel contents only while open, unmounting them
 * once the exit animation finishes. Opt into this when the closed contents should leave the DOM;
 * otherwise apply `rdxCollapsiblePanel` directly (optionally with `keepMounted`).
 */
@Directive({
    selector: 'ng-template[rdxCollapsiblePanelPresence]',
    providers: [
        provideRdxPresenceContext(() => ({
            present: injectCollapsibleRootContext()!.open
        }))
    ],
    hostDirectives: [RdxPresenceDirective]
})
export class RdxCollapsiblePanelPresenceDirective {}
