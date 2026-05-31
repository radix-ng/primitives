import { Component, Directive, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';

/**
 * Demo wrapper that mirrors how real consumers apply the presence directive:
 * a selectored `ng-template` directive that composes `RdxPresenceDirective` via
 * `hostDirectives` and feeds it a `present` signal through the presence context.
 */
@Directive({
    selector: 'ng-template[presenceDemo]',
    hostDirectives: [RdxPresenceDirective]
})
export class PresenceDemo {}

@Component({
    selector: 'presence-example',
    imports: [PresenceDemo],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceExample).open }))],
    styles: `
        @keyframes presence-enter {
            from {
                opacity: 0;
                transform: scale(0.96);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes presence-exit {
            from {
                opacity: 1;
                transform: scale(1);
            }
            to {
                opacity: 0;
                transform: scale(0.96);
            }
        }

        .presence-box[data-state='open'] {
            animation: presence-enter 200ms ease-out;
        }

        /* The directive keeps the element mounted while this exit animation runs. */
        .presence-box[data-state='closed'] {
            animation: presence-exit 200ms ease-in;
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
                        class="presence-box border-border bg-card text-card-foreground flex h-24 w-48 items-center justify-center rounded-md border text-sm shadow-sm"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        I'm present
                    </div>
                </ng-template>
            </div>

            <p class="text-muted-foreground text-sm">present: {{ open() }}</p>
        </div>
    `
})
export class PresenceExample {
    readonly open = signal(false);
}
