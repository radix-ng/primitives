import { Directive, input, isDevMode } from '@angular/core';
import { RdxPortalContainer, RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Structural directive that teleports the combobox popup into a container (default `document.body`)
 * while the combobox is open, and keeps it mounted until any CSS exit `@keyframes` finishes.
 *
 * Apply it with the `*` microsyntax on the positioner —
 * `<div *rdxComboboxPortal rdxComboboxPositioner>` — or as an explicit `<ng-template rdxComboboxPortal>`.
 * For a custom container use the explicit form with `[container]`.
 *
 * @group Components
 */
@Directive({
    selector: 'ng-template[rdxComboboxPortal]',
    exportAs: 'rdxComboboxPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
    providers: [provideRdxPresenceContext(() => ({ present: injectComboboxRootContext().open }))]
})
export class RdxComboboxPortal {
    /**
     * Optional container to portal the content into. Defaults to `document.body`. Declared here (and
     * forwarded to the composed {@link RdxPortalPresence}) so the autocomplete portal can re-expose it
     * through its own `hostDirectives`.
     */
    readonly container = input<RdxPortalContainer>();
}

/**
 * Dev-mode guard: `rdxComboboxPortal` used to be an attribute directive on a `<div>`. It is now
 * structural, so the old `<div rdxComboboxPortal>` markup would silently stop portaling — fail loudly
 * instead.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxPortal]:not(ng-template)'
})
export class RdxComboboxPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            throw new Error(
                '[rdxComboboxPortal] is now a structural directive. ' +
                    'Use `*rdxComboboxPortal` on the positioner element or `<ng-template rdxComboboxPortal>`. ' +
                    'rdxComboboxPortalPresence has been removed. See https://radix-ng.com/components/combobox.md'
            );
        }
    }
}
