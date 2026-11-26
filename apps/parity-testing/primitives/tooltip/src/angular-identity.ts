import { Component, computed, signal } from '@angular/core';
import {
    createRdxTooltipHandle,
    RdxTooltip,
    RdxTooltipArrow,
    type RdxTooltipOpenChangeEvent,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger,
    RdxTooltipViewport,
    type RdxTrackCursorAxis
} from '@radix-ng/primitives/tooltip';
import { copyId, identityInitialState, type IdentityRequest, pasteId } from './identity';

const initial = identityInitialState();

@Component({
    selector: 'parity-tooltip',
    imports: [
        RdxTooltip,
        RdxTooltipTrigger,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipPopup,
        RdxTooltipArrow,
        RdxTooltipViewport
    ],
    template: `
        <div style="display: flex; gap: 160px; margin: 48px" data-identity-triggers>
            <button
                [id]="copyId"
                [handle]="handle"
                [delay]="pointer ? 0 : undefined"
                [closeDelay]="pointer ? 240 : undefined"
                rdxTooltipTrigger
                payload="Copy payload"
                type="button"
            >
                Copy
            </button>
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
            [trackCursorAxis]="cursorAxis()"
            [disableHoverablePopup]="disableHover()"
            (onOpenChange)="request($event)"
            (onOpenChangeComplete)="completions.update(append($event))"
            rdxTooltip
        >
            <ng-template [keepMounted]="keepMounted()" rdxTooltipPortal>
                <div [side]="side" [sideOffset]="pointer ? 24 : 0" rdxTooltipPositioner data-identity-positioner>
                    <div rdxTooltipPopup data-identity-popup>
                        @if (viewport) {
                            <div rdxTooltipViewport data-identity-viewport>
                                <div>{{ root.payload() }}</div>
                            </div>
                        } @else {
                            {{ root.payload() }}
                        }
                        @if (arrow) {
                            <span rdxTooltipArrow data-identity-arrow></span>
                        }
                    </div>
                </div>
            </ng-template>
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
        @if (lifecycle) {
            <button (click)="holdClose = true" type="button">Hold next close</button>
            <button (click)="root.unmount()" type="button">Finish close</button>
            <button (click)="keepMounted.set(false)" type="button">Remove retention</button>
            <output data-identity-completions>{{ completionLog() }}</output>
        }
        @if (pointer) {
            <button (click)="cursorAxis.set('x')" type="button">Track X</button>
            <button (click)="cursorAxis.set('y')" type="button">Track Y</button>
            <button (click)="cursorAxis.set('both')" type="button">Track both</button>
            <button (click)="cursorAxis.set('none')" type="button">Stop tracking</button>
            <button (click)="disableHover.set(true)" type="button">Disable popup hover</button>
        }
        <output data-identity-requests>{{ log() }}</output>
    `
})
export class TooltipIdentityFixture {
    protected readonly copyId = copyId;
    protected readonly viewport = initial.viewport;
    protected readonly lifecycle = initial.lifecycle;
    protected readonly pointer = initial.pointer;
    protected readonly arrow = initial.arrow;
    protected readonly side = initial.side;
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
    protected holdClose = false;
    protected readonly keepMounted = signal(initial.lifecycle);
    protected readonly cursorAxis = signal<RdxTrackCursorAxis>('none');
    protected readonly disableHover = signal(false);
    protected readonly completions = signal<boolean[]>([]);
    protected readonly completionLog = computed(() => JSON.stringify(this.completions()));
    protected readonly append = (open: boolean) => (previous: boolean[]) => [...previous, open];
    private readonly requests = signal<IdentityRequest[]>([]);
    protected readonly log = computed(() => JSON.stringify(this.requests()));

    protected request({ open, eventDetails }: RdxTooltipOpenChangeEvent): void {
        if (!open && this.cancelClose) {
            this.cancelClose = false;
            eventDetails.cancel();
        }
        if (!open && !eventDetails.isCanceled() && this.holdClose) {
            this.holdClose = false;
            eventDetails.preventUnmountOnClose();
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
