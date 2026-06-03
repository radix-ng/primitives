import { injectSelectRootContext } from './select-root';
import { Directive, isDevMode } from '@angular/core';
import { rdxDevError } from '@radix-ng/primitives/core';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';

/**
 * Structural directive that teleports the select popup into a container (default `document.body`)
 * while the select is open, and keeps it mounted until any CSS exit `@keyframes` finishes.
 *
 * Apply it with the `*` microsyntax on the popup — `<div *rdxSelectPortal rdxSelectPopup>` — or as an
 * explicit `<ng-template rdxSelectPortal>`. For a custom container use the explicit form with
 * `[container]`. Unlike the previous attribute portal it no longer parks an empty wrapper `<div>` in
 * `document.body` while the select is closed.
 */
@Directive({
    selector: 'ng-template[rdxSelectPortal]',
    exportAs: 'rdxSelectPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
    providers: [provideRdxPresenceContext(() => ({ present: injectSelectRootContext().open }))]
})
export class RdxSelectPortal {}

/**
 * Dev-mode guard: `rdxSelectPortal` used to be an attribute directive on a `<div>`. It is now
 * structural, so the old `<div rdxSelectPortal>` markup would silently stop portaling — fail loudly
 * instead.
 */
@Directive({
    selector: '[rdxSelectPortal]:not(ng-template)'
})
export class RdxSelectPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            rdxDevError(
                'select/portal-on-element',
                '`rdxSelectPortal` is now a structural directive. ' +
                    'Use `*rdxSelectPortal` on the popup element or `<ng-template rdxSelectPortal>`. ' +
                    'rdxSelectPortalPresence has been removed.',
                'components/select'
            );
        }
    }
}
