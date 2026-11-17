import { ChangeDetectionStrategy, Component, Directive, inject, signal } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-example',
    imports: [PresenceDemo],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceExample).open }))],
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
                        class="presence-box border-border bg-card text-card-foreground flex h-24 w-48 items-center justify-center rounded-md border text-sm shadow-sm transition-[opacity,transform] duration-200 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 starting:scale-95 starting:opacity-0"
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
