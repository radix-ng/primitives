import { Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/**
 * ADR 0011 fixture: the exit is a **CSS transition** (no `@keyframes` anywhere). Before the WAAPI
 * upgrade the presence machine only watched the root's computed `animationName`, so a transition
 * unmounted instantly; now `getAnimations()` sees the running transition and keeps the element
 * mounted until it finishes. Driven by `presence-waapi.behavior.spec.ts`.
 */
@Component({
    selector: 'presence-waapi-transition',
    imports: [PresenceDemo],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiTransition).open }))],
    styles: `
        .waapi-box {
            transition:
                opacity 300ms ease,
                transform 300ms ease;
        }

        /* Exit is a transition — the machine must wait for it via the Web Animations API. */
        .waapi-box[data-state='closed'] {
            opacity: 0;
            transform: scale(0.96);
        }
    `,
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
                        class="waapi-box border-border bg-card text-card-foreground flex h-24 w-48 items-center justify-center rounded-md border text-sm shadow-sm"
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
