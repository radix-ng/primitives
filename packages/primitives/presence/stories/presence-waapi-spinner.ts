import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/**
 * ADR 0011 fixture for the **freshness filter**: a never-ending spinner runs inside the content the
 * whole time it is open, but there is no exit animation. The spinner's `startTime` predates the
 * close, so `startTime >= closeTimestamp` excludes it and the content unmounts immediately — a
 * subtree-aware machine must not be held open forever by a pre-existing infinite animation. Driven
 * by `presence-waapi.behavior.spec.ts`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-waapi-spinner',
    imports: [PresenceDemo],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiSpinner).open }))],
    // Exception to the no-story-CSS rule: this fixture needs a pre-existing infinite `@keyframes`
    // spinner to exercise the freshness filter. A named, infinite `@keyframes` can't be expressed with
    // headless Tailwind utilities story-locally, so the styles stay here.
    styles: `
        @keyframes waapi-spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Pre-existing infinite animation — running before *and* during the close, never an exit. */
        .waapi-spinner {
            animation: waapi-spin 1s linear infinite;
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
                        class="waapi-root border-border bg-card flex h-24 w-48 items-center justify-center rounded-md border shadow-sm"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        <div
                            class="waapi-spinner border-muted-foreground size-6 rounded-full border-2 border-t-transparent"
                        ></div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceWaapiSpinner {
    readonly open = signal(false);
}
