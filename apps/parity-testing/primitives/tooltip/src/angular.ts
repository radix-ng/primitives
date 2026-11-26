import { Component, computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxTooltip,
    RdxTooltipOpenChangeEvent,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipProvider,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';
import { TooltipIdentityFixture } from './angular-identity';
import {
    groupTimeout,
    hoverCloseDelay,
    hoverDelay,
    installFixture,
    type OpenRequest,
    triggerHoverCloseDelay,
    triggerHoverDelay,
    updatedHoverCloseDelay,
    updatedHoverDelay
} from './contract';

const initial = installFixture();

@Component({
    selector: 'parity-tooltip',
    imports: [
        RdxTooltip,
        RdxTooltipTrigger,
        RdxTooltipPortal,
        RdxTooltipPositioner,
        RdxTooltipPopup,
        RdxTooltipProvider
    ],
    template: `
        <div [delay]="providerDelay()" [closeDelay]="providerCloseDelay()" [timeout]="timeout()" rdxTooltipProvider>
            <ng-container
                [open]="open()"
                [defaultOpen]="defaultOpen()"
                [disabled]="disabled()"
                [disableHoverablePopup]="interactions"
                (onOpenChange)="request($event)"
                rdxTooltip
            >
                <button [delay]="primaryDelay" [closeDelay]="primaryCloseDelay()" rdxTooltipTrigger type="button">
                    Copy
                </button>
                <div *rdxTooltipPortal rdxTooltipPositioner>
                    <div rdxTooltipPopup data-popup="Copy">Copy to clipboard</div>
                </div>
            </ng-container>
            @if (interactions) {
                <ng-container [disableHoverablePopup]="true" (onOpenChange)="request($event, true)" rdxTooltip>
                    <button [delay]="siblingDelay" rdxTooltipTrigger type="button">Paste</button>
                    <div *rdxTooltipPortal rdxTooltipPositioner>
                        <div rdxTooltipPopup data-popup="Paste">Paste from clipboard</div>
                    </div>
                </ng-container>
            }
        </div>
        <button (click)="open.set(true)" type="button">Set open</button>
        <button (click)="open.set(false)" type="button">Set closed</button>
        <button (click)="open.set(undefined)" type="button">Release open</button>
        <button (click)="defaultOpen.set(true)" type="button">Set default open</button>
        <button (click)="cancelNext = true" type="button">Cancel next request</button>
        @if (interactions) {
            <input aria-label="Outside" />
            <button (click)="disabled.set(true)" type="button">Disable root</button>
            <button (click)="disabled.set(false)" type="button">Enable root</button>
            <button (click)="updateProviderDelays()" type="button">Update provider delays</button>
            <button (click)="overrideCloseDelay()" type="button">Override close delay</button>
            <button (click)="timeout.set(0)" type="button">End instant window</button>
        }
        <output data-requests="Copy">{{ serializedRequests() }}</output>
        <output data-requests="Paste">{{ serializedSiblingRequests() }}</output>
    `
})
class TooltipFixture {
    protected readonly interactions = initial.interactions;
    protected readonly providerDelay = signal(hoverDelay);
    protected readonly providerCloseDelay = signal(initial.interactions ? hoverCloseDelay : 0);
    protected readonly primaryDelay = initial.interactions ? undefined : hoverDelay;
    protected readonly primaryCloseDelay = signal<number | undefined>(undefined);
    protected readonly siblingDelay = triggerHoverDelay;
    protected readonly timeout = signal(groupTimeout);
    protected readonly open = signal(initial.open);
    protected readonly defaultOpen = signal(initial.defaultOpen);
    protected readonly disabled = signal(false);
    protected cancelNext = false;
    private readonly requests = signal<OpenRequest[]>([]);
    private readonly siblingRequests = signal<OpenRequest[]>([]);
    protected readonly serializedRequests = computed(() => JSON.stringify(this.requests()));
    protected readonly serializedSiblingRequests = computed(() => JSON.stringify(this.siblingRequests()));

    protected updateProviderDelays(): void {
        this.providerDelay.set(updatedHoverDelay);
        this.providerCloseDelay.set(updatedHoverCloseDelay);
    }

    protected overrideCloseDelay(): void {
        this.primaryCloseDelay.set(triggerHoverCloseDelay);
    }

    protected request({ open, eventDetails }: RdxTooltipOpenChangeEvent, sibling = false): void {
        if (!sibling && this.cancelNext) {
            this.cancelNext = false;
            eventDetails.cancel();
        }

        const log = sibling ? this.siblingRequests : this.requests;
        log.update((requests) => [
            ...requests,
            { open, reason: eventDetails.reason, canceled: eventDetails.isCanceled() }
        ]);
    }
}

void bootstrapApplication(initial.identity ? TooltipIdentityFixture : TooltipFixture, {
    providers: [provideZonelessChangeDetection()]
});
