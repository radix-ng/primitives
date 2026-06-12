import { Directive, input, isDevMode } from '@angular/core';
import { RdxPortalContainer, RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectRdxDialogRootContext } from './dialog-root';

/**
 * Structural directive that teleports the dialog content (backdrop + popup) into a container (default
 * `document.body`) while the dialog is open, and keeps it mounted until the CSS exit `@keyframes` on
 * every root element finish.
 *
 * Dialog has two root nodes (backdrop + popup), so use the explicit `<ng-template rdxDialogPortal>`
 * form. Pass `[container]` to portal into a different element.
 */
@Directive({
    selector: 'ng-template[rdxDialogPortal]',
    exportAs: 'rdxDialogPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
    providers: [provideRdxPresenceContext(() => ({ present: injectRdxDialogRootContext().isOpen }))]
})
export class RdxDialogPortal {
    /**
     * Optional container to portal the content into. Defaults to `document.body`. Declared here (and
     * forwarded to the composed {@link RdxPortalPresence}) so that the drawer and alert-dialog portals
     * can re-expose it through their own `hostDirectives`.
     */
    readonly container = input<RdxPortalContainer>();
}

/**
 * Dev-mode guard: `rdxDialogPortal` used to be an attribute directive on a `<div>`. It is now
 * structural, so the old `<div rdxDialogPortal>` markup would silently stop portaling — fail loudly
 * instead.
 */
@Directive({
    selector: '[rdxDialogPortal]:not(ng-template)'
})
export class RdxDialogPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            throw new Error(
                '[rdxDialogPortal] is now a structural directive. ' +
                    'Use `<ng-template rdxDialogPortal>` around the backdrop and popup. ' +
                    'rdxDialogPortalPresence has been removed. See https://radix-ng.com/components/dialog.md'
            );
        }
    }
}
