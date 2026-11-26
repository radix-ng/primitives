import { Component, computed, signal } from '@angular/core';
import {
    createRdxTooltipHandle,
    RdxTooltip,
    type RdxTooltipOpenChangeEvent,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';
import { copyId, identityInitialState, type IdentityRequest, pasteId } from './identity';

const initial = identityInitialState();

@Component({
    selector: 'parity-tooltip',
    imports: [RdxTooltip, RdxTooltipTrigger, RdxTooltipPortal, RdxTooltipPositioner, RdxTooltipPopup],
    template: `
        <div style="display: flex; gap: 160px; margin: 48px">
            <button [id]="copyId" [handle]="handle" rdxTooltipTrigger payload="Copy payload" type="button">Copy</button>
            @if (showPaste()) {
                @for (version of [pasteVersion()]; track version) {
                    <button [id]="pasteId" [handle]="handle" [payload]="pastePayload()" rdxTooltipTrigger type="button">
                        Paste
                    </button>
                }
            }
        </div>
        <ng-container
            #root="rdxTooltip"
            [open]="open"
            [defaultOpen]="defaultOpen"
            [triggerId]="triggerId()"
            [defaultTriggerId]="defaultTriggerId()"
            [handle]="handle"
            (onOpenChange)="request($event)"
            rdxTooltip
        >
            <div *rdxTooltipPortal rdxTooltipPositioner side="bottom" data-identity-positioner>
                <div rdxTooltipPopup data-identity-popup>{{ root.payload() }}</div>
            </div>
        </ng-container>

        <button (click)="triggerId.set(copyId)" type="button">Use Copy trigger</button>
        <button (click)="triggerId.set(pasteId)" type="button">Use Paste trigger</button>
        <button (click)="triggerId.set(null)" type="button">Release trigger</button>
        <button (click)="defaultTriggerId.set(copyId)" type="button">Set default to Copy</button>
        <button (click)="pastePayload.set('Updated Paste payload')" type="button">Update Paste payload</button>
        <button (click)="pasteVersion.update(increment)" type="button">Replace Paste</button>
        <button (click)="showPaste.set(false)" type="button">Hide Paste</button>
        <button (click)="showPaste.set(true)" type="button">Show Paste</button>
        <button (click)="cancelClose = true" type="button">Cancel next close</button>
        <button (click)="handle.open(copyId)" type="button">Open Copy via handle</button>
        <button (click)="handle.open(pasteId)" type="button">Open Paste via handle</button>
        <button (click)="handle.close()" type="button">Close via handle</button>
        <output data-identity-requests>{{ log() }}</output>
    `
})
export class TooltipIdentityFixture {
    protected readonly copyId = copyId;
    protected readonly pasteId = pasteId;
    protected readonly open = initial.open;
    protected readonly defaultOpen = initial.defaultOpen;
    protected readonly defaultTriggerId = signal(initial.defaultTriggerId);
    protected readonly triggerId = signal(initial.triggerId);
    protected readonly showPaste = signal(initial.showPaste);
    protected readonly pastePayload = signal('Paste payload');
    protected readonly pasteVersion = signal(0);
    protected readonly increment = (value: number) => value + 1;
    protected readonly handle = createRdxTooltipHandle<string>();
    protected cancelClose = false;
    private readonly requests = signal<IdentityRequest[]>([]);
    protected readonly log = computed(() => JSON.stringify(this.requests()));

    protected request({ open, eventDetails }: RdxTooltipOpenChangeEvent): void {
        if (!open && this.cancelClose) {
            this.cancelClose = false;
            eventDetails.cancel();
        }

        this.requests.update((previous) => [
            ...previous,
            {
                open,
                reason: eventDetails.reason,
                canceled: eventDetails.isCanceled(),
                trigger: eventDetails.trigger?.id ?? null
            }
        ]);
    }
}
