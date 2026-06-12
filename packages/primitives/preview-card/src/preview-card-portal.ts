import { Directive, isDevMode } from '@angular/core';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectRdxPreviewCardRootContext } from './preview-card-root';

/**
 * Structural directive that teleports the preview-card content into a container (default
 * `document.body`) while the card is open, and keeps it mounted until any CSS exit `@keyframes`
 * finishes.
 *
 * Apply it with the `*` microsyntax on the positioner —
 * `<div *rdxPreviewCardPortal rdxPreviewCardPositioner>` — or as an explicit
 * `<ng-template rdxPreviewCardPortal>`. For a custom container use the explicit form with `[container]`.
 */
@Directive({
    selector: 'ng-template[rdxPreviewCardPortal]',
    exportAs: 'rdxPreviewCardPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
    providers: [provideRdxPresenceContext(() => ({ present: injectRdxPreviewCardRootContext().isOpen }))]
})
export class RdxPreviewCardPortal {}

/**
 * Dev-mode guard: `rdxPreviewCardPortal` used to be an attribute directive on a `<div>`. It is now
 * structural, so the old `<div rdxPreviewCardPortal>` markup would silently stop portaling — fail
 * loudly instead.
 */
@Directive({
    selector: '[rdxPreviewCardPortal]:not(ng-template)'
})
export class RdxPreviewCardPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            throw new Error(
                '[rdxPreviewCardPortal] is now a structural directive. ' +
                    'Use `*rdxPreviewCardPortal` on the positioner element or `<ng-template rdxPreviewCardPortal>`. ' +
                    'rdxPreviewCardPortalPresence has been removed. See https://radix-ng.com/components/preview-card.md'
            );
        }
    }
}
