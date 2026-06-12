import { Directive, isDevMode } from '@angular/core';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectRdxPopoverRootContext } from './popover-root';

/**
 * Structural directive that teleports the popover content into a container (default `document.body`)
 * while the popover is open, and keeps it mounted until any CSS exit `@keyframes` finishes.
 *
 * Apply it with the `*` microsyntax on the positioner — `<div *rdxPopoverPortal rdxPopoverPositioner>`
 * — or as an explicit `<ng-template rdxPopoverPortal>`. For a custom container use the explicit form
 * with `[container]`.
 */
@Directive({
    selector: 'ng-template[rdxPopoverPortal]',
    exportAs: 'rdxPopoverPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
    providers: [provideRdxPresenceContext(() => ({ present: injectRdxPopoverRootContext().isOpen }))]
})
export class RdxPopoverPortal {}

/**
 * Dev-mode guard: `rdxPopoverPortal` used to be an attribute directive on a `<div>`. It is now
 * structural, so the old `<div rdxPopoverPortal>` markup would silently stop portaling — fail loudly
 * instead.
 */
@Directive({
    selector: '[rdxPopoverPortal]:not(ng-template)'
})
export class RdxPopoverPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            throw new Error(
                '[rdxPopoverPortal] is now a structural directive. ' +
                    'Use `*rdxPopoverPortal` on the positioner element or `<ng-template rdxPopoverPortal>`. ' +
                    'rdxPopoverPortalPresence has been removed. See https://radix-ng.com/components/popover.md'
            );
        }
    }
}
