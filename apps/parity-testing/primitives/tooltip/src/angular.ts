import { Component, computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    RdxTooltip,
    RdxTooltipOpenChangeEvent,
    RdxTooltipPopup,
    RdxTooltipPortal,
    RdxTooltipPositioner,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';
import { hoverDelay, installFixture, type OpenRequest } from './contract';

const initial = installFixture();

@Component({
    selector: 'parity-tooltip',
    imports: [RdxTooltip, RdxTooltipTrigger, RdxTooltipPortal, RdxTooltipPositioner, RdxTooltipPopup],
    template: `
        <ng-container [open]="open()" [defaultOpen]="defaultOpen()" (onOpenChange)="request($event)" rdxTooltip>
            <button [delay]="delay" rdxTooltipTrigger type="button">Copy</button>
            <div *rdxTooltipPortal rdxTooltipPositioner>
                <div rdxTooltipPopup data-popup>Copy to clipboard</div>
            </div>
        </ng-container>
        <button (click)="open.set(true)" type="button">Set open</button>
        <button (click)="open.set(false)" type="button">Set closed</button>
        <button (click)="open.set(undefined)" type="button">Release open</button>
        <button (click)="defaultOpen.set(true)" type="button">Set default open</button>
        <button (click)="cancelNext = true" type="button">Cancel next request</button>
        <output data-requests>{{ serializedRequests() }}</output>
    `
})
class TooltipFixture {
    protected readonly delay = hoverDelay;
    protected readonly open = signal(initial.open);
    protected readonly defaultOpen = signal(initial.defaultOpen);
    protected cancelNext = false;
    private readonly requests = signal<OpenRequest[]>([]);
    protected readonly serializedRequests = computed(() => JSON.stringify(this.requests()));

    protected request({ open, eventDetails }: RdxTooltipOpenChangeEvent): void {
        if (this.cancelNext) {
            this.cancelNext = false;
            eventDetails.cancel();
        }
        this.requests.update((requests) => [
            ...requests,
            { open, reason: eventDetails.reason, canceled: eventDetails.isCanceled() }
        ]);
    }
}

void bootstrapApplication(TooltipFixture, { providers: [provideZonelessChangeDetection()] });
