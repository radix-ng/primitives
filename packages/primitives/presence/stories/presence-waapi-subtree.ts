import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceTarget } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/** A nested animation participates only through an explicit rdxPresenceTarget. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-waapi-subtree',
    imports: [PresenceDemo, RdxPresenceTarget],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiSubtree).open }))],
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
                        class="waapi-root group border-border bg-card flex h-24 w-48 items-center justify-center rounded-md border p-2 shadow-sm"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        <div
                            class="waapi-child text-card-foreground text-sm group-data-[state=closed]:animate-ping group-data-[state=closed]:[animation-duration:var(--duration-demo-presence-animation)] group-data-[state=closed]:[animation-iteration-count:1]"
                            rdxPresenceTarget
                        >
                            explicit descendant exit
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceWaapiSubtree {
    readonly open = signal(false);
}
