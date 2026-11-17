import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/**
 * A root CSS transition retains the live view without keyframes or animation-name heuristics.
 * Driven by presence-waapi.behavior.spec.ts in real browsers.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-waapi-transition',
    imports: [PresenceDemo],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiTransition).open }))],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                (click)="open.set(!open())"
                type="button"
            >
                {{ open() ? 'Unmount' : 'Mount' }}
            </button>

            <div class="flex h-28 items-center">
                <ng-template presenceDemo>
                    <div
                        class="waapi-box border-border bg-card text-card-foreground flex h-24 w-48 items-center justify-center rounded-md border text-sm shadow-sm transition-[opacity,transform] duration-300 ease-[ease] data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        transition exit
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceWaapiTransition {
    readonly open = signal(false);
}
