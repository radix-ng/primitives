import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    signal,
    viewChild
} from '@angular/core';
import { createFloatingRootContext } from '@radix-ng/primitives/core';
import { RdxDismiss, RdxDismissReason, RdxOutsidePressEvent } from '@radix-ng/primitives/dismissable-layer';

interface LogEntry {
    id: number;
    label: string;
    detail: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dismissable-layer-demo',
    standalone: true,
    template: `
        <section class="mx-auto grid w-full max-w-3xl gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
            <div class="border-border bg-background rounded-lg border p-3 shadow-sm">
                <div class="mb-3 flex flex-wrap items-center gap-2">
                    <button
                        #trigger
                        class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        [attr.aria-expanded]="open()"
                        (click)="toggleLayer()"
                    >
                        {{ open() ? 'Close layer' : 'Open layer' }}
                    </button>

                    <button
                        class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        type="button"
                        (click)="
                            preventNextOutside.set(true);
                            record('veto armed', 'the next outside press will call preventDefault()')
                        "
                    >
                        Veto next
                    </button>

                    <label
                        class="border-border bg-background text-foreground inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm shadow-sm"
                    >
                        <input
                            class="border-border text-primary focus:ring-ring h-4 w-4 rounded"
                            type="checkbox"
                            [checked]="outsideMode() === 'intentional'"
                            (change)="toggleOutsideMode()"
                        />
                        Intentional outside press
                    </label>
                </div>

                <div
                    class="border-border bg-muted/40 grid min-h-64 gap-3 rounded-lg border border-dashed p-3 lg:grid-cols-[minmax(0,1fr)_260px]"
                >
                    <div class="bg-background flex min-h-52 flex-col justify-between rounded-md p-3">
                        <div>
                            <p class="text-foreground text-sm font-medium">Outside document area</p>
                            <p class="text-muted-foreground mt-1 text-xs">Document listeners classify these targets.</p>
                        </div>

                        <div class="space-y-2">
                            <button
                                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                type="button"
                            >
                                Outside press target
                            </button>

                            <label class="text-muted-foreground block text-sm">
                                Outside focus target
                                <input
                                    class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-1 h-8 w-full rounded-md border px-3 text-sm shadow-sm transition-colors outline-none focus-visible:ring-2"
                                    type="text"
                                    placeholder="Focus after opening"
                                />
                            </label>
                        </div>
                    </div>

                    <div class="bg-background relative flex min-h-52 items-center justify-center rounded-md p-3">
                        @if (open()) {
                            <article
                                #layer
                                class="border-border bg-popover text-popover-foreground ring-border focus-visible:ring-ring w-full rounded-lg border p-3 shadow-lg ring-1 outline-none focus-visible:ring-2"
                                tabindex="-1"
                            >
                                <div class="mb-2 flex items-start justify-between gap-3">
                                    <div>
                                        <h3 class="text-foreground text-sm font-semibold">Floating layer</h3>
                                        <p class="text-muted-foreground mt-1 text-xs">Floating element</p>
                                    </div>
                                    <span
                                        class="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-1 text-xs font-medium"
                                    >
                                        open
                                    </span>
                                </div>

                                <input
                                    class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mb-2 h-8 w-full rounded-md border px-3 text-sm shadow-sm transition-colors outline-none focus-visible:ring-2"
                                    type="text"
                                    placeholder="Inside focus"
                                />

                                <button
                                    class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-8 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                    type="button"
                                    (click)="closeFromButton()"
                                >
                                    Close
                                </button>
                            </article>
                        } @else {
                            <div
                                class="border-border bg-muted text-muted-foreground rounded-md border px-3 py-2 text-center text-sm"
                            >
                                Closed
                            </div>
                        }
                    </div>
                </div>
            </div>

            <aside class="border-border bg-background rounded-lg border p-3 shadow-sm">
                <div class="mb-3">
                    <h3 class="text-foreground text-sm font-semibold">Dismiss pipeline</h3>
                    <p class="text-muted-foreground mt-1 text-xs">Hooks first, then final reason.</p>
                </div>

                <dl class="grid grid-cols-2 gap-2 text-sm">
                    <div class="bg-muted rounded-md p-2">
                        <dt class="text-muted-foreground text-xs font-medium uppercase">Open</dt>
                        <dd class="text-foreground mt-1 font-semibold">{{ open() }}</dd>
                    </div>
                    <div class="bg-muted rounded-md p-2">
                        <dt class="text-muted-foreground text-xs font-medium uppercase">Press mode</dt>
                        <dd class="text-foreground mt-1 font-semibold">{{ outsideMode() }}</dd>
                    </div>
                    <div class="bg-muted rounded-md p-2">
                        <dt class="text-muted-foreground text-xs font-medium uppercase">Floating</dt>
                        <dd class="text-foreground mt-1 font-semibold">{{ hasFloatingElement() ? 'set' : 'null' }}</dd>
                    </div>
                    <div class="bg-muted rounded-md p-2">
                        <dt class="text-muted-foreground text-xs font-medium uppercase">Reference</dt>
                        <dd class="text-foreground mt-1 font-semibold">{{ hasReferenceElement() ? 'set' : 'null' }}</dd>
                    </div>
                </dl>

                <ol class="mt-3 space-y-2">
                    @for (entry of logs(); track entry.id) {
                        <li class="border-border bg-card text-card-foreground rounded-md border p-2 text-sm">
                            <div class="font-medium">{{ entry.label }}</div>
                            <div class="text-muted-foreground mt-1 text-xs">{{ entry.detail }}</div>
                        </li>
                    }
                </ol>
            </aside>
        </section>
    `
})
export class RdxDismissableLayerDemo {
    private readonly host = inject(ElementRef<HTMLElement>);
    private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
    private readonly layer = viewChild<ElementRef<HTMLElement>>('layer');
    private nextLogId = 0;

    readonly open = signal(true);
    readonly outsideMode = signal<RdxOutsidePressEvent>('sloppy');
    readonly preventNextOutside = signal(false);
    readonly hasReferenceElement = computed(() => this.trigger() !== undefined);
    readonly hasFloatingElement = computed(() => this.layer() !== undefined);
    readonly logs = signal<LogEntry[]>([
        {
            id: this.nextLogId++,
            label: 'context created',
            detail: 'RdxDismiss reads open(), referenceElement, floatingElement, and trigger registry from it.'
        }
    ]);

    readonly floatingContext = createFloatingRootContext({
        ownerDocument: this.host.nativeElement.ownerDocument,
        open: () => this.open()
    });

    constructor() {
        effect(() => {
            const trigger = this.trigger()?.nativeElement ?? null;
            const layer = this.layer()?.nativeElement ?? null;

            this.floatingContext.setReferenceElement(trigger);
            this.floatingContext.setFloatingElement(layer);
        });

        new RdxDismiss(this.floatingContext, () => null, {
            outsidePressEvent: () => this.outsideMode(),
            onEscapeKeyDown: (event) => {
                this.record('onEscapeKeyDown', `${event.key} reached the active layer.`);
            },
            onPointerDownOutside: (event) => {
                if (this.preventNextOutside()) {
                    event.preventDefault();
                    this.preventNextOutside.set(false);
                    this.record('outside press vetoed', `${event.type} was prevented before onDismiss.`);
                    return;
                }

                this.record('onPointerDownOutside', `${event.type} landed outside the logical layer.`);
            },
            onFocusOutside: (event) => {
                this.record('onFocusOutside', `${event.type} moved focus outside the logical layer.`);
            },
            onDismiss: (reason, event) => this.dismiss(reason, event)
        });
    }

    toggleLayer(): void {
        this.open.update((value) => !value);
        this.record('open toggled', `context.open() is now ${this.open()}.`);
    }

    toggleOutsideMode(): void {
        this.outsideMode.update((value) => (value === 'sloppy' ? 'intentional' : 'sloppy'));
        this.record('mode changed', `outsidePressEvent now resolves to ${this.outsideMode()}.`);
    }

    closeFromButton(): void {
        this.open.set(false);
        this.record('button close', 'Inside interactions are ignored by RdxDismiss and handled by the layer.');
    }

    record(label: string, detail: string): void {
        const entry = { id: this.nextLogId++, label, detail };
        this.logs.update((items) => [entry, ...items].slice(0, 6));
    }

    private dismiss(reason: RdxDismissReason, event: Event): void {
        this.open.set(false);
        this.record(`onDismiss: ${reason}`, `${event.type} was not prevented, so the layer closed.`);
    }
}
