import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceTarget } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/** An explicitly registered infinite spinner never holds a finite render lifetime open. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-waapi-spinner',
    imports: [PresenceDemo, RdxPresenceTarget],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiSpinner).open }))],
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
                            class="waapi-spinner border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent"
                            rdxPresenceTarget
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
