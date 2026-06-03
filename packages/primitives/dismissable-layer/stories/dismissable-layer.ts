import { booleanAttribute, Component, input, signal } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';

const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const primaryButtonClasses =
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

@Component({
    selector: 'dismissable-layer',
    imports: [RdxDismissableLayer],
    template: `
        <div class="grid w-2xl grid-cols-[minmax(0,1fr)_15rem] gap-4">
            <section
                class="border-border bg-card text-card-foreground flex min-h-80 flex-col gap-4 rounded-xl border p-5 shadow-sm"
            >
                <div>
                    <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Interactive surface</p>
                    <h3 class="mt-1 text-base font-semibold">Dismissable layer</h3>
                    <p class="text-muted-foreground mt-1 text-sm leading-6">
                        Open the layer, then click outside, move focus outside, or press Escape.
                    </p>
                </div>

                <div class="flex flex-wrap gap-2">
                    <button class="${primaryButtonClasses}" (click)="openLayer()" type="button">Open layer</button>
                    <button class="${buttonClasses}" id="outside" type="button">Outside action</button>
                </div>

                @if (open()) {
                    <div
                        class="border-border bg-background text-foreground flex flex-col gap-4 rounded-lg border p-4 shadow-sm"
                        (dismiss)="handleDismiss()"
                        (pointerDownOutside)="handlePointerDownOutside($event)"
                        (escapeKeyDown)="handleEscapeKeyDown($event)"
                        (focusOutside)="handleFocusOutside($event)"
                        rdxDismissableLayer
                    >
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <p class="text-sm font-medium">Active layer</p>
                                <p class="text-muted-foreground mt-1 text-xs">Listening for outside interactions.</p>
                            </div>
                            <span class="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
                                Open
                            </span>
                        </div>
                        <input
                            class="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 rounded-md border px-3 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                            placeholder="Focus here, then tab outside"
                            type="text"
                        />
                        <button class="${buttonClasses}" (click)="closeLayer()" type="button">Close layer</button>
                    </div>
                } @else {
                    <div
                        class="border-border bg-muted/40 text-muted-foreground flex flex-1 items-center justify-center rounded-lg border border-dashed p-4 text-sm"
                    >
                        The layer is closed.
                    </div>
                }
            </section>

            <aside class="border-border bg-muted/30 rounded-xl border p-4">
                <div class="flex items-center justify-between gap-3">
                    <h3 class="text-sm font-semibold">Event log</h3>
                    <button
                        class="text-muted-foreground hover:text-foreground text-xs font-medium"
                        (click)="clearLog()"
                    >
                        Clear
                    </button>
                </div>
                <ol class="mt-3 flex flex-col gap-2">
                    @for (event of events(); track $index) {
                        <li class="border-border bg-background rounded-md border px-2.5 py-2 text-xs">{{ event }}</li>
                    } @empty {
                        <li class="text-muted-foreground text-xs leading-5">Interactions will appear here.</li>
                    }
                </ol>
            </aside>
        </div>
    `
})
export class DismissableLayer {
    readonly preventEscapeKeyDownEvent = input(false, { transform: booleanAttribute });

    readonly preventPointerDownOutsideEvent = input(false, { transform: booleanAttribute });

    readonly preventFocusOutsideEvent = input(false, { transform: booleanAttribute });

    readonly open = signal(false);

    readonly events = signal<string[]>([]);

    openLayer() {
        this.open.set(true);
        this.addEvent('layer opened');
    }

    closeLayer() {
        this.open.set(false);
        this.addEvent('close button clicked');
    }

    clearLog() {
        this.events.set([]);
    }

    handleDismiss() {
        this.open.set(false);
        this.addEvent('dismiss');
    }

    handleEscapeKeyDown(event: KeyboardEvent) {
        this.addEvent('escapeKeyDown');
        if (this.preventEscapeKeyDownEvent()) event.preventDefault();
    }

    handlePointerDownOutside(event: PointerEvent) {
        this.addEvent('pointerDownOutside');
        if (this.preventPointerDownOutsideEvent()) event.preventDefault();
    }

    handleFocusOutside(event: FocusEvent) {
        this.addEvent('focusOutside');
        if (this.preventFocusOutsideEvent()) event.preventDefault();
    }

    private addEvent(event: string) {
        this.events.update((events) => [event, ...events].slice(0, 8));
    }
}
