import { Directive, isDevMode } from '@angular/core';
import { RdxComboboxPortal } from '@radix-ng/primitives/combobox';

/**
 * Structural directive that teleports the autocomplete popup into a container (default
 * `document.body`) while the autocomplete is open, keeping it mounted until any CSS exit `@keyframes`
 * finishes. Composes the structural {@link RdxComboboxPortal} (which reads the open state from the
 * combobox root context provided by `RdxAutocompleteRoot`).
 *
 * Apply it with the `*` microsyntax on the positioner —
 * `<div *rdxAutocompletePortal rdxAutocompletePositioner>` — or as an explicit
 * `<ng-template rdxAutocompletePortal>`. For a custom container use the explicit form with `[container]`.
 *
 * @group Components
 */
@Directive({
    selector: 'ng-template[rdxAutocompletePortal]',
    exportAs: 'rdxAutocompletePortal',
    hostDirectives: [{ directive: RdxComboboxPortal, inputs: ['container'] }]
})
export class RdxAutocompletePortal {}

/**
 * Dev-mode guard: `rdxAutocompletePortal` is now structural, so the old `<div rdxAutocompletePortal>`
 * markup would silently stop portaling — fail loudly instead.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompletePortal]:not(ng-template)'
})
export class RdxAutocompletePortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            throw new Error(
                '[rdxAutocompletePortal] is now a structural directive. ' +
                    'Use `*rdxAutocompletePortal` on the positioner element or `<ng-template rdxAutocompletePortal>`. ' +
                    'rdxAutocompletePortalPresence has been removed. See https://radix-ng.com/components/autocomplete.md'
            );
        }
    }
}
