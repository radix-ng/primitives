import { Directive, isDevMode } from '@angular/core';
import { rdxDevError } from '@radix-ng/primitives/core';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectRdxTooltipContext } from './tooltip';

/**
 * Structural directive that teleports the tooltip content into a container (default `document.body`).
 * The content remains mounted through CSS exit motion. Set `keepMounted` to retain it between opens.
 *
 * Apply it with the `*` microsyntax on the positioner — `<div *rdxTooltipPortal rdxTooltipPositioner>`
 * — or use an explicit `<ng-template rdxTooltipPortal>` to configure `container` or `keepMounted`.
 */
@Directive({
    selector: 'ng-template[rdxTooltipPortal]',
    exportAs: 'rdxTooltipPortal',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container', 'keepMounted'] }],
    providers: [
        provideRdxPresenceContext(() => {
            const root = injectRdxTooltipContext();
            return {
                present: root.present,
                renderLifecycle: root.renderLifecycle,
                registerPresence: root.registerPresence
            };
        })
    ]
})
export class RdxTooltipPortal {}

/**
 * Dev-mode guard: `rdxTooltipPortal` used to be an attribute directive on a `<div>`. It is now
 * structural, so the old `<div rdxTooltipPortal>` markup would silently stop portaling — fail loudly
 * instead.
 */
@Directive({
    selector: '[rdxTooltipPortal]:not(ng-template)'
})
export class RdxTooltipPortalMisuseGuard {
    constructor() {
        if (isDevMode()) {
            rdxDevError(
                'tooltip/portal-on-element',
                '`rdxTooltipPortal` is now a structural directive. ' +
                    'Use `*rdxTooltipPortal` on the positioner element or `<ng-template rdxTooltipPortal>`. ' +
                    'rdxTooltipPortalPresence has been removed.',
                'components/tooltip'
            );
        }
    }
}
