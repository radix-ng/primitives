import { Component, inject } from '@angular/core';
import { RdxPortal } from '@radix-ng/primitives/portal';
import { AuditPortal, AuditState, HydrationProbe } from './app';

if (typeof window !== 'undefined' && window.portalHydrationAudit) window.portalHydrationAudit.lazyLoaded = true;

/** Referenced only inside @defer, so the AOT compiler creates a real lazy dependency. */
@Component({
    selector: 'audit-lazy-portal-view',
    imports: [RdxPortal, AuditPortal, HydrationProbe],
    template: `
        @if (state.settings.placement.startsWith('pending-lazy')) {
            <audit-probe name="first" />
        } @else if (state.settings.kind === 'attribute') {
            <section [container]="state.destination()" rdxPortal data-portal-host>
                <audit-probe name="first" />
            </section>
        } @else {
            <ng-template [container]="state.destination()" auditPortal>
                <audit-probe name="first" />
            </ng-template>
        }
    `
})
export class LazyPortalView {
    readonly state = inject(AuditState);
}
