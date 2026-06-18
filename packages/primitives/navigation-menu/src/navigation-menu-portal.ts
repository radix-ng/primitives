import { booleanAttribute, computed, Directive, inject, input, isDevMode } from '@angular/core';
import { rdxDevError } from '@radix-ng/primitives/core';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * Structural directive that teleports the navigation menu popup into a container (default
 * `document.body`) while the menu is open, and keeps it mounted until any CSS exit `@keyframes`
 * finishes. Set `[keepMounted]="true"` to keep the portal mounted while closed.
 *
 * Apply it with the `*` microsyntax on the positioner —
 * `<div *rdxNavigationMenuPortal rdxNavigationMenuPositioner>` — or as an explicit
 * `<ng-template rdxNavigationMenuPortal>`. For a custom container use the explicit form with
 * `[container]`.
 */
@Directive({
    selector: 'ng-template[rdxNavigationMenuPortal]',
    exportAs: 'rdxNavigationMenuPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
    providers: [provideRdxPresenceContext(() => ({ present: inject(RdxNavigationMenuPortal).present }))]
})
export class RdxNavigationMenuPortal {
    private readonly rootContext = injectNavigationMenuRootContext();

    /**
     * Keep the portal mounted while the menu is closed.
     */
    readonly keepMounted = input(false, { transform: booleanAttribute });

    readonly present = computed(() => this.rootContext.present() || this.keepMounted());
}

/**
 * Dev-mode guard: `rdxNavigationMenuPortal` used to be an attribute directive on a `<div>`. It is now
 * structural, so the old `<div rdxNavigationMenuPortal>` markup would silently stop portaling — fail
 * loudly instead.
 */
@Directive({
    selector: '[rdxNavigationMenuPortal]:not(ng-template)'
})
export class RdxNavigationMenuPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            rdxDevError(
                'navigation-menu/portal-on-element',
                '`rdxNavigationMenuPortal` is now a structural directive. ' +
                    'Use `*rdxNavigationMenuPortal` on the positioner element or ' +
                    '`<ng-template rdxNavigationMenuPortal>`. rdxNavigationMenuPortalPresence has been removed.',
                'components/navigation-menu'
            );
        }
    }
}
