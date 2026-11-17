import { Component, Directive, inject, signal } from '@angular/core';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { cn, demoButton } from '../../storybook/styles';

@Directive({
    selector: 'ng-template[pendingPresencePortal]',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }]
})
class PendingPresencePortal {}

@Component({
    selector: 'presence-pending-portal',
    imports: [PendingPresencePortal],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresencePendingPortal).open }))],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button [class]="buttonClass" (click)="open.set(!open())" type="button">
                {{ open() ? 'Unmount' : 'Mount' }}
            </button>
            <button [class]="buttonClass" (click)="destinationReady.set(!destinationReady())" type="button">
                {{ destinationReady() ? 'Suspend destination' : 'Resolve destination' }}
            </button>
            <div
                class="pending-portal-destination border-border flex min-h-24 w-64 items-center justify-center rounded-md border border-dashed p-4"
                #destination
                aria-label="Portal destination"
            ></div>
            <ng-template [container]="destinationReady() ? destination : null" pendingPresencePortal>
                <span class="pending-portal-content text-foreground text-sm">Portaled content</span>
            </ng-template>
        </div>
    `
})
export class PresencePendingPortal {
    readonly open = signal(false);
    readonly destinationReady = signal(true);
    readonly buttonClass = cn(demoButton.base, demoButton.outline, demoButton.size.md);
}
