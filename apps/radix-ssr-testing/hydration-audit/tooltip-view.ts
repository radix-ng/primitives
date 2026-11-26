import { afterNextRender, Component, Directive, input, signal } from '@angular/core';
import {
    createRdxTooltipHandle,
    RdxTooltip,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';

@Directive({
    selector: '[auditTooltipTrigger]',
    host: { '[attr.data-tooltip-hydrated]': 'hydrated() ? "" : undefined' }
})
class TooltipAuditTrigger {
    protected readonly hydrated = signal(false);

    constructor() {
        afterNextRender(() => this.hydrated.set(true));
    }
}

@Component({
    selector: 'audit-tooltip-view',
    imports: [
        RdxTooltip,
        RdxTooltipTrigger,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipPopup,
        TooltipAuditTrigger
    ],
    template: `
        @if (late()) {
            @defer (hydrate on interaction) {
                <button
                    [id]="lateId"
                    [handle]="handle"
                    [closeOnClick]="false"
                    auditTooltipTrigger
                    rdxTooltipTrigger
                    payload="Late details"
                    data-audit-tooltip-trigger
                    type="button"
                >
                    Tooltip trigger
                </button>
            }
        }
        <ng-container
            #root="rdxTooltip"
            [handle]="late() ? handle : undefined"
            [defaultTriggerId]="late() ? lateId : null"
            rdxTooltip
            defaultOpen
        >
            @if (!late()) {
                <button
                    auditTooltipTrigger
                    rdxTooltipTrigger
                    payload="Initial details"
                    data-audit-tooltip-trigger
                    type="button"
                >
                    Tooltip trigger
                </button>
            }
            <div *rdxTooltipPortal rdxTooltipPositioner data-audit-tooltip-positioner>
                <div rdxTooltipPopup data-audit-tooltip-popup>{{ root.payload() }}</div>
            </div>
        </ng-container>
        <button (click)="root.close()" data-audit-tooltip-close type="button">Close tooltip</button>
        <ng-container [open]="false" rdxTooltip defaultOpen>
            <button rdxTooltipTrigger type="button">Controlled closed tooltip</button>
            <div *rdxTooltipPortal rdxTooltipPositioner>
                <div rdxTooltipPopup data-audit-tooltip-unexpected>Unexpected tooltip</div>
            </div>
        </ng-container>
    `
})
export class TooltipAuditView {
    readonly late = input(false);
    protected readonly handle = createRdxTooltipHandle<string>();
    protected readonly lateId = 'audit-detached-tooltip-trigger';
}
