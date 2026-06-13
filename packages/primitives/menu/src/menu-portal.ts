import { Directive, isDevMode } from '@angular/core';
import { rdxDevError } from '@radix-ng/primitives/core';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectRdxMenuRootContext } from './menu-root';

/**
 * Structural directive that teleports the menu popup into a container (default `document.body`) while
 * the menu is open, and keeps it mounted until any CSS exit `@keyframes` finishes.
 *
 * This replaces the consumer-owned `@if (root.open())` mount: it adds both teleporting *and*
 * exit-animation support. Apply it with the `*` microsyntax on the positioner —
 * `<div *rdxMenuPortal rdxMenuPositioner>` — or as an explicit `<ng-template rdxMenuPortal>`. For a
 * custom container, or a backdrop alongside the positioner (multi-root), use the explicit form.
 */
@Directive({
    selector: 'ng-template[rdxMenuPortal]',
    exportAs: 'rdxMenuPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
    providers: [provideRdxPresenceContext(() => ({ present: injectRdxMenuRootContext().isOpen }))]
})
export class RdxMenuPortal {}

/**
 * Dev-mode guard: `rdxMenuPortal` is a structural directive. The old `<div rdxMenuPortal>` markup
 * would silently stop portaling — fail loudly instead.
 */
@Directive({
    selector: '[rdxMenuPortal]:not(ng-template)'
})
export class RdxMenuPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            rdxDevError(
                'menu/portal-on-element',
                '`rdxMenuPortal` is a structural directive. ' +
                    'Use `*rdxMenuPortal` on the positioner element or `<ng-template rdxMenuPortal>`.',
                'components/menu'
            );
        }
    }
}
