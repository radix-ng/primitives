import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/**
 * ADR 0011 fixture: the exit `@keyframes` run on a **nested child**, not the watched root. The root
 * itself has no animation. Before the WAAPI upgrade only the root was inspected, so this unmounted
 * instantly (this is exactly what the rollout's positioner "decoy keyframes" worked around); with
 * `getAnimations({ subtree: true })` the descendant exit keeps the element mounted. Driven by
 * `presence-waapi.behavior.spec.ts`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-waapi-subtree',
    imports: [PresenceDemo],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiSubtree).open }))],
    // Exception to the no-story-CSS rule: this fixture deliberately runs an exit `@keyframes` on a
    // nested child to prove subtree detection. A named, descendant-targeted `@keyframes` can't be
    // expressed with headless Tailwind utilities story-locally, so the styles stay here.
    styles: `
        @keyframes waapi-child-exit {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }

        /* The exit animation lives on a descendant; the root carries no animation/transition. */
        .waapi-root[data-state='closed'] .waapi-child {
            animation: waapi-child-exit 300ms ease-in;
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
                        class="waapi-root border-border bg-card flex h-24 w-48 items-center justify-center rounded-md border p-2 shadow-sm"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        <div class="waapi-child text-card-foreground text-sm">subtree exit</div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceWaapiSubtree {
    readonly open = signal(false);
}
