# Dismissable Layer

#### Detects interactions outside a layer and provides the low-level behavior used by dialogs, popovers, and menus.

```html
<dismissable-layer
    [preventEscapeKeyDownEvent]="preventEscapeKeyDownEvent"
    [preventPointerDownOutsideEvent]="preventPointerDownOutsideEvent"
    [preventFocusOutsideEvent]="preventFocusOutsideEvent"
/>
```

## Features

- Emits events for Escape, pointer interactions outside, focus outside, and combined outside interactions.
- Dismisses the topmost active layer when an event is not prevented.
- Supports nested layers and closes them one at a time.
- Can disable pointer events outside the active layer.
- Supports detached branches that remain interactive without dismissing the layer.

## Anatomy

```html
<div (dismiss)="close()" rdxDismissableLayer>
  Layer content
</div>
```

Prevent an individual dismiss reason by calling `preventDefault()` on the corresponding event:

```html
<div
  (escapeKeyDown)="$event.preventDefault()"
  (pointerDownOutside)="$event.preventDefault()"
  (focusOutside)="$event.preventDefault()"
  rdxDismissableLayer
>
  Layer content
</div>
```

## Examples

### Floating overlays — the three engines

A dialog, menu, popover, or tooltip is a _floating_ layer on top of the page. To behave correctly,
something has to decide three things — **dismissal** ([ADR 0015](https://github.com/radix-ng/primitives/blob/main/docs/adr/0015-base-ui-aligned-dismissal-engine.md)), **scroll-lock** ([ADR 0016](https://github.com/radix-ng/primitives/blob/main/docs/adr/0016-scroll-lock-parity-and-activation-policy.md)), and **focus management** ([ADR 0017](https://github.com/radix-ng/primitives/blob/main/docs/adr/0017-floating-focus-manager.md)) — each owned by its own engine reading from **one shared layer tree**. The explainer below walks through how they coordinate; open the dialog → menu → submenu, then press **Escape** or click outside and watch the live panel.

```typescript
import { Component, computed, ElementRef, signal, viewChild } from '@angular/core';
import { cn, demoButton, demoCard, demoMenu } from '../../storybook/styles';

type LayerType = 'modal' | 'menu';

interface LayerDef {
    id: 'dialog' | 'menu' | 'submenu';
    label: string;
    type: LayerType;
}

interface LogEntry {
    kind: 'dismiss' | 'scroll' | 'focus' | 'open';
    text: string;
}

const DEFS: Record<LayerDef['id'], LayerDef> = {
    dialog: { id: 'dialog', label: 'Dialog', type: 'modal' },
    menu: { id: 'menu', label: 'Menu', type: 'menu' },
    submenu: { id: 'submenu', label: 'Submenu', type: 'menu' }
};

/**
 * Three fixed engine accents. Inside `[data-demo="tailwind"]` the docs palette (`--color-violet`
 * etc.) is reset to `initial`, and there is no semantic token for "three distinguishable hues", so
 * these are literal `oklch()` arbitrary-value utilities — chosen at mid lightness/chroma so the dots
 * and badges read on both the light and dark Storybook themes. Alpha is baked into the value to avoid
 * relying on the `/opacity` modifier on arbitrary colors.
 */
const ACCENT = {
    dismiss: {
        dot: 'bg-[oklch(60%_0.2_295)]',
        text: 'text-[oklch(60%_0.2_295)]',
        soft: 'bg-[oklch(60%_0.2_295/0.14)]',
        border: 'border-[oklch(60%_0.2_295/0.45)]',
        bar: 'border-l-[oklch(60%_0.2_295)]'
    },
    scroll: {
        dot: 'bg-[oklch(60%_0.16_245)]',
        text: 'text-[oklch(60%_0.16_245)]',
        soft: 'bg-[oklch(60%_0.16_245/0.14)]',
        border: 'border-[oklch(60%_0.16_245/0.45)]',
        bar: 'border-l-[oklch(60%_0.16_245)]'
    },
    focus: {
        dot: 'bg-[oklch(58%_0.14_155)]',
        text: 'text-[oklch(58%_0.14_155)]',
        soft: 'bg-[oklch(58%_0.14_155/0.14)]',
        border: 'border-[oklch(58%_0.14_155/0.45)]',
        bar: 'border-l-[oklch(58%_0.14_155)]'
    }
} as const;

const ROWS = ['Atlas API', 'Billing', 'Webhooks', 'Integrations'];

/** The three engines, as the header cards present them (each maps to one ADR). */
const ENGINE_CARDS = [
    {
        name: 'Dismissal',
        adr: 'ADR 0015',
        heading: 'Closing',
        desc: 'What to close on Esc or an outside click. When layers are nested, only the topmost one closes — one level at a time.',
        accent: ACCENT.dismiss
    },
    {
        name: 'Scroll-lock',
        adr: 'ADR 0016',
        heading: 'Scroll blocking',
        desc: 'While a modal layer is open the background must not scroll — and must not jump when the scrollbar disappears.',
        accent: ACCENT.scroll
    },
    {
        name: 'Focus manager',
        adr: 'ADR 0017',
        heading: 'Focus management',
        desc: 'Keyboard focus is trapped inside the layer, the rest of the page is hidden from screen readers, and focus returns to the trigger on close.',
        accent: ACCENT.focus
    }
] as const;

/**
 * Interactive explainer for the "floating overlays" architecture (ADR 0015 dismissal, 0016 scroll
 * lock, 0017 focus manager). It is a self-contained *simulation*, not a wiring of the real primitives:
 * one shared layer **tree** (`stack`) is the single source of truth, and the three engines on the
 * right read from it. Open Dialog → Menu → Submenu, then press Escape or click outside and watch which
 * layer closes, whether the background is scroll-locked, and where focus is trapped.
 */
@Component({
    selector: 'floating-overlays-explainer',
    template: `
        <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 py-2">
            <!-- intro -->
            <header class="flex flex-col gap-4">
                <p class="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                    Radix NG · floating overlays
                </p>
                <h1 class="text-foreground max-w-2xl text-3xl font-extrabold tracking-tight">
                    What floating layers actually do
                </h1>
                <p class="text-muted-foreground max-w-2xl text-base leading-7">
                    A dialog, menu, popover, or tooltip is a
                    <span class="text-foreground font-medium">floating</span>
                    layer on top of the page. For these to behave correctly, something has to decide
                    <span class="text-foreground font-medium">three things</span>
                    . Three ADRs bring order: one shared
                    <span class="text-foreground font-medium">layer tree</span>
                    and three tidy engines that read from it.
                </p>
            </header>

            <!-- three engines -->
            <section class="flex flex-col gap-3">
                <p class="text-muted-foreground font-mono text-xs tracking-wider uppercase">Three engines</p>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    @for (card of engineCards; track card.adr) {
                        <div class="${cn(demoCard, 'flex flex-col gap-1 border-l-2 p-4')}" [class]="card.accent.bar">
                            <div class="flex items-center gap-2">
                                <span class="size-2 shrink-0 rounded-full" [class]="card.accent.dot"></span>
                                <span class="text-foreground font-mono text-sm font-semibold">{{ card.name }}</span>
                                <span
                                    class="border-border text-muted-foreground ml-auto rounded-full border px-2 py-0.5 font-mono text-[11px]"
                                >
                                    {{ card.adr }}
                                </span>
                            </div>
                            <p class="text-foreground mt-1 text-sm font-semibold">{{ card.heading }}</p>
                            <p class="text-muted-foreground text-sm leading-6">{{ card.desc }}</p>
                        </div>
                    }
                </div>
            </section>

            <!-- one tree -->
            <div class="${cn(demoCard, 'flex items-start gap-3 p-4')}">
                <span class="${cn(ACCENT.dismiss.text, 'shrink-0 font-mono text-sm font-semibold')}">one tree →</span>
                <p class="text-muted-foreground text-sm leading-6">
                    Previously each mechanism guessed on its own which layer was “topmost” — which caused bugs: the
                    wrong layer closed, focus escaped, the background scrolled. Now there is
                    <span class="text-foreground font-medium">one tree</span>
                    that knows the real parent → child relationships, even when layers are physically rendered in
                    different parts of the DOM (portals).
                </p>
            </div>

            <!-- live example -->
            <div class="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 class="text-foreground text-xl font-bold tracking-tight">Live example</h2>
                <span class="text-muted-foreground text-sm">
                    Open the dialog → menu → submenu. Then press
                    <span class="text-foreground font-medium">Esc</span>
                    or click outside and watch the panel on the right.
                </span>
            </div>

            <div class="grid h-[420px] w-full grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
                <!-- faux app -->
                <div
                    class="${cn(demoCard, 'relative flex flex-col overflow-hidden outline-none')}"
                    #stage
                    (keydown)="onKeydown($event)"
                    (pointerdown)="onStagePointer($event)"
                    tabindex="-1"
                    role="group"
                    aria-label="Floating overlays demo"
                >
                    <!-- window chrome -->
                    <div class="border-border bg-muted/40 flex h-9 shrink-0 items-center gap-3 border-b px-3">
                        <div class="flex gap-1.5">
                            <span class="bg-muted-foreground/40 size-2.5 rounded-full"></span>
                            <span class="bg-muted-foreground/40 size-2.5 rounded-full"></span>
                            <span class="bg-muted-foreground/40 size-2.5 rounded-full"></span>
                        </div>
                        <span class="text-muted-foreground font-mono text-xs">app.example.com / settings</span>
                        @if (modalOpen()) {
                            <span
                                class="${cn(
                                    ACCENT.scroll.text,
                                    ACCENT.scroll.soft,
                                    ACCENT.scroll.border,
                                    'ml-auto inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px]'
                                )}"
                            >
                                <span class="${cn(ACCENT.scroll.dot, 'size-1.5 rounded-full')}"></span>
                                scroll locked
                            </span>
                        }
                    </div>

                    <!-- scrollable page -->
                    <div class="relative flex-1 overflow-y-auto p-4" [class.overflow-hidden]="modalOpen()">
                        <h3 class="text-foreground text-sm font-semibold">Project settings</h3>
                        <p class="text-muted-foreground mt-0.5 mb-3 text-xs">
                            Scroll the list — when the modal dialog opens, the background freezes.
                        </p>
                        @for (name of rows; track name) {
                            <div
                                class="border-border bg-background mb-2 flex items-center gap-3 rounded-lg border p-2.5"
                            >
                                <span class="bg-muted size-7 shrink-0 rounded-md"></span>
                                <span class="text-xs">
                                    <span class="text-foreground block font-medium">{{ name }}</span>
                                    <span class="text-muted-foreground">updated 2d ago</span>
                                </span>
                            </div>
                        }
                        <button
                            class="${cn(demoButton.base, demoButton.destructive, demoButton.size.sm, 'mt-1')}"
                            #deleteBtn
                            (click)="open('dialog')"
                            type="button"
                        >
                            Delete project…
                        </button>
                    </div>

                    <!-- backdrop -->
                    <div
                        class="bg-foreground/50 absolute inset-0 z-10 transition-opacity duration-150"
                        #backdrop
                        [class]="modalOpen() ? 'opacity-100' : 'pointer-events-none opacity-0'"
                    ></div>

                    <!-- dialog (modal, root) -->
                    <div
                        class="${cn(
                            demoCard,
                            'absolute top-12 left-1/2 z-20 w-80 -translate-x-1/2 p-4 transition-all duration-150'
                        )}"
                        #dialog
                        [class]="layerClass('dialog', 'translate-y-0', '-translate-y-1')"
                        role="dialog"
                        aria-modal="true"
                    >
                        <p class="text-foreground text-sm font-semibold">Delete “Project Atlas”?</p>
                        <p class="text-muted-foreground mt-1.5 mb-4 text-xs leading-5">
                            This cannot be undone. Open the menu to nest a child layer on top of this modal.
                        </p>
                        <div class="flex items-center gap-2">
                            <button
                                class="${cn(demoButton.base, demoButton.outline, demoButton.size.sm)}"
                                #moreBtn
                                (click)="open('menu')"
                                type="button"
                            >
                                More options ▾
                            </button>
                            <span class="flex-1"></span>
                            <button
                                class="${cn(demoButton.base, demoButton.ghost, demoButton.size.sm)}"
                                (click)="close(byId('dialog'), 'cancel')"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                class="${cn(demoButton.base, demoButton.destructive, demoButton.size.sm)}"
                                type="button"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <!-- menu (child of dialog, non-modal) -->
                    <div
                        class="${cn(demoMenu.popup, 'absolute top-44 left-6 z-30 w-48 transition-all duration-150')}"
                        #menu
                        [class]="layerClass('menu', '', '-translate-y-1')"
                        role="menu"
                    >
                        <button class="${cn(demoMenu.item, 'w-full text-left')}" type="button">Rename project</button>
                        <button class="${cn(demoMenu.item, 'w-full text-left')}" type="button">Duplicate</button>
                        <button
                            class="${cn(demoMenu.item, 'w-full justify-between text-left')}"
                            #exportItem
                            (click)="open('submenu')"
                            type="button"
                        >
                            Export first
                            <span class="text-muted-foreground">▸</span>
                        </button>
                        <div class="${demoMenu.separator}"></div>
                        <button class="${cn(demoMenu.item, 'text-destructive w-full text-left')}" type="button">
                            Move to trash
                        </button>
                    </div>

                    <!-- submenu (child of menu) -->
                    <div
                        class="${cn(demoMenu.popup, 'absolute top-52 left-52 z-40 w-44 transition-all duration-150')}"
                        #submenu
                        [class]="layerClass('submenu', '', '-translate-y-1')"
                        role="menu"
                    >
                        <button class="${cn(demoMenu.item, 'w-full text-left')}" type="button">Export as JSON</button>
                        <button class="${cn(demoMenu.item, 'w-full text-left')}" type="button">Export as CSV</button>
                        <button class="${cn(demoMenu.item, 'w-full text-left')}" type="button">Export as PDF</button>
                    </div>
                </div>

                <!-- live panel -->
                <div class="flex min-h-0 flex-col gap-3">
                    <!-- layer tree -->
                    <div class="${cn(demoCard, 'p-3')}">
                        <h4
                            class="text-muted-foreground mb-2 font-mono text-[11px] font-semibold tracking-wider uppercase"
                        >
                            Layer tree
                        </h4>
                        <div class="font-mono text-xs">
                            <div class="text-muted-foreground flex items-center gap-2 px-1 py-1">
                                <span>▢</span>
                                <span>page (document body)</span>
                            </div>
                            @for (node of treeNodes(); track node.depth) {
                                <div [class]="node.rowClass">
                                    <span class="text-muted-foreground">{{ node.glyph }}</span>
                                    <span [class]="node.labelClass">{{ node.label }}</span>
                                    @if (node.isModal) {
                                        <span class="${cn(ACCENT.scroll.text, 'text-[10px]')}">·modal</span>
                                    }
                                    <span [class]="node.badgeClass">{{ node.badge }}</span>
                                </div>
                            }
                            @if (!stack().length) {
                                <div class="text-muted-foreground mt-1 px-1 text-xs">No open layers.</div>
                            }
                        </div>
                    </div>

                    <!-- engines -->
                    <div class="${cn(demoCard, 'p-3')}">
                        <h4
                            class="text-muted-foreground mb-3 font-mono text-[11px] font-semibold tracking-wider uppercase"
                        >
                            Engines — live state
                        </h4>
                        <div class="flex flex-col gap-2.5">
                            @for (e of engines(); track e.key) {
                                <div class="flex items-center gap-2.5">
                                    <span
                                        class="size-2.5 shrink-0 rounded-full transition-transform duration-300"
                                        [class]="cn(e.dot, pulsing().has(e.key) ? 'scale-[1.8]' : 'scale-100')"
                                    ></span>
                                    <span class="text-foreground w-20 shrink-0 text-xs font-semibold">
                                        {{ e.label }}
                                    </span>
                                    <span class="text-muted-foreground font-mono text-[11px]">{{ e.value }}</span>
                                    <span
                                        class="border-border text-muted-foreground ml-auto shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[10px]"
                                    >
                                        {{ e.adr }}
                                    </span>
                                </div>
                            }
                        </div>
                    </div>

                    <!-- event log -->
                    <div class="${cn(demoCard, 'flex min-h-0 flex-1 flex-col p-3')}">
                        <h4
                            class="text-muted-foreground mb-2 font-mono text-[11px] font-semibold tracking-wider uppercase"
                        >
                            Event log
                        </h4>
                        <div class="min-h-0 flex-1 overflow-y-auto font-mono text-[11px] leading-5">
                            @for (entry of log(); track $index) {
                                <div
                                    class="border-border/60 text-muted-foreground first:text-foreground flex gap-2 border-b py-1"
                                >
                                    <span class="${'w-16 shrink-0 font-semibold'}" [class]="logLabel(entry.kind).cls">
                                        {{ logLabel(entry.kind).text }}
                                    </span>
                                    <span>{{ entry.text }}</span>
                                </div>
                            }
                            @if (!log().length) {
                                <div class="text-muted-foreground text-[11px]">
                                    Empty — interact with the layers on the left.
                                </div>
                            }
                        </div>
                        <div class="mt-3 flex gap-2">
                            <button
                                class="${cn(demoButton.base, demoButton.outline, demoButton.size.sm)}"
                                [disabled]="!stack().length"
                                (click)="dismissTop('esc')"
                                type="button"
                            >
                                Esc
                            </button>
                            <button
                                class="${cn(demoButton.base, demoButton.ghost, demoButton.size.sm)}"
                                (click)="reset()"
                                type="button"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- footnote -->
            <p class="text-muted-foreground text-sm leading-6">
                Under the hood, each open layer registers a node in the shared tree and the engines read from it —
                <code class="${cn('bg-muted text-foreground rounded-sm px-1 py-0.5 font-mono text-xs')}">
                    RdxDismissableLayer
                </code>
                (0015),
                <code class="${cn('bg-muted text-foreground rounded-sm px-1 py-0.5 font-mono text-xs')}">
                    useScrollLock
                </code>
                (0016), and
                <code class="${cn('bg-muted text-foreground rounded-sm px-1 py-0.5 font-mono text-xs')}">
                    RdxFloatingFocusManager
                </code>
                (0017). The “topmost” layer is always the deepest open node in the tree — not whatever rendered last in
                the DOM.
            </p>
        </div>
    `
})
export class FloatingOverlaysExplainer {
    protected readonly cn = cn;
    protected readonly rows = ROWS;
    protected readonly engineCards = ENGINE_CARDS;

    private readonly backdropRef = viewChild.required<ElementRef<HTMLElement>>('backdrop');
    private readonly deleteBtnRef = viewChild.required<ElementRef<HTMLButtonElement>>('deleteBtn');
    private readonly dialogRef = viewChild.required<ElementRef<HTMLElement>>('dialog');
    private readonly menuRef = viewChild.required<ElementRef<HTMLElement>>('menu');
    private readonly submenuRef = viewChild.required<ElementRef<HTMLElement>>('submenu');

    /** The single source of truth: the open layer tree, deepest node last (= topmost). */
    protected readonly stack = signal<LayerDef[]>([]);
    protected readonly log = signal<LogEntry[]>([]);
    protected readonly pulsing = signal<ReadonlySet<string>>(new Set());
    /** Layer briefly ringed when it is dismissed, so the eye catches *which* node closed. */
    protected readonly flashId = signal<LayerDef['id'] | null>(null);

    protected readonly top = computed(() => this.stack().at(-1) ?? null);
    protected readonly modalOpen = computed(() => this.stack().some((l) => l.type === 'modal'));

    protected readonly treeNodes = computed(() => {
        const stack = this.stack();
        return stack.map((n, i) => {
            const isTop = i === stack.length - 1;
            return {
                label: n.label,
                depth: i + 1,
                isTop,
                isModal: n.type === 'modal',
                glyph: isTop ? '└─' : '├─',
                badge: isTop ? 'topmost' : n.type === 'modal' ? 'root' : 'child',
                // Precomputed here (not in the template) so the `[class]` bindings stay plain Angular
                // expressions — `${cn(...)}` interpolation is only valid in static `class="…"` values.
                rowClass: cn(
                    this.depthIndent(i + 1),
                    'my-0.5 flex items-center gap-2 rounded-md px-2 py-1',
                    isTop ? cn(ACCENT.dismiss.soft, ACCENT.dismiss.border, 'border') : ''
                ),
                labelClass: isTop ? cn(ACCENT.dismiss.text, 'font-semibold') : 'text-foreground',
                badgeClass: cn(
                    'border-border text-muted-foreground ml-auto rounded-full border px-1.5 py-0.5 text-[10px]',
                    isTop ? cn(ACCENT.dismiss.text, ACCENT.dismiss.border) : ''
                )
            };
        });
    });

    protected readonly engines = computed(() => {
        const top = this.top();
        const locked = this.modalOpen();
        const active = this.stack().length > 0;
        return [
            {
                key: 'dismiss',
                label: 'Dismissal',
                adr: 'ADR 0015',
                dot: active ? ACCENT.dismiss.dot : 'bg-muted-foreground/40',
                value: active ? `armed — topmost is ${top!.label}` : 'idle — waiting for Esc / outside click'
            },
            {
                key: 'scroll',
                label: 'Scroll-lock',
                adr: 'ADR 0016',
                dot: locked ? ACCENT.scroll.dot : 'bg-muted-foreground/40',
                value: locked ? 'on — background frozen (modal open)' : 'off — background scrolls'
            },
            {
                key: 'focus',
                label: 'Focus',
                adr: 'ADR 0017',
                dot: top ? ACCENT.focus.dot : 'bg-muted-foreground/40',
                value: top ? `trapped in ${top.label}` : 'on the page'
            }
        ] as const;
    });

    protected isOpen(id: LayerDef['id']): boolean {
        return this.stack().some((l) => l.id === id);
    }

    protected byId(id: LayerDef['id']): LayerDef {
        return DEFS[id];
    }

    /** Static base + open/closed transform — the layer stays mounted so refs and transitions are stable. */
    protected layerClass(id: LayerDef['id'], shownTransform: string, hiddenTransform: string): string {
        const flash = this.flashId() === id ? 'ring-2 ring-[oklch(60%_0.2_295)]' : '';
        return this.isOpen(id)
            ? cn('pointer-events-auto opacity-100', shownTransform, flash)
            : cn('pointer-events-none opacity-0', hiddenTransform);
    }

    /** Tree indentation per depth — literal classes so the Tailwind scanner picks them up. */
    protected depthIndent(depth: number): string {
        return ['ml-3.5', 'ml-7', 'ml-[42px]'][depth - 1] ?? 'ml-[42px]';
    }

    protected logLabel(kind: LogEntry['kind']): { text: string; cls: string } {
        switch (kind) {
            case 'dismiss':
                return { text: 'DISMISS', cls: ACCENT.dismiss.text };
            case 'scroll':
                return { text: 'SCROLL', cls: ACCENT.scroll.text };
            case 'focus':
                return { text: 'FOCUS', cls: ACCENT.focus.text };
            default:
                return { text: 'OPEN', cls: 'text-muted-foreground' };
        }
    }

    protected open(id: LayerDef['id']): void {
        if (this.isOpen(id)) {
            return;
        }
        const def = DEFS[id];
        this.stack.update((s) => [...s, def]);
        this.logEvent('open', `Opened ${def.label} → new node in the tree${def.type === 'modal' ? ' (modal)' : ''}`);
        if (def.type === 'modal') {
            this.pulse('scroll');
            this.logEvent('scroll', 'Modal opened → background scroll locked');
        }
        this.pulse('focus');
        this.logEvent('focus', `Focus moved into and trapped within ${def.label}`);
        this.focusFirst(this.layerEl(id));
    }

    protected close(node: LayerDef, reason: 'cancel' | 'esc' | 'outside'): void {
        const idx = this.stack().findIndex((l) => l.id === node.id);
        if (idx < 0) {
            return;
        }
        const wasLocked = this.modalOpen();
        // Closing a node also drops every descendant above it.
        this.stack.update((s) => s.slice(0, idx));

        if (reason === 'cancel') {
            this.pulse('dismiss');
            this.logEvent('dismiss', `Cancel → closed ${node.label} and its child layers`);
        }
        if (wasLocked && !this.modalOpen()) {
            this.pulse('scroll');
            this.logEvent('scroll', 'No modal layers left → background scroll unlocked');
        }
        const top = this.top();
        this.pulse('focus');
        this.logEvent('focus', top ? `Focus returned to ${top.label}` : 'Focus returned to the trigger button');
        this.returnFocus();
    }

    protected dismissTop(reason: 'esc' | 'outside'): void {
        const t = this.top();
        if (!t) {
            return;
        }
        this.flash(t.id);
        this.pulse('dismiss');
        const word = reason === 'esc' ? 'Esc' : 'Outside click';
        this.logEvent('dismiss', `${word} → closed ${t.label} (topmost in the tree); lower layers untouched`);
        this.close(t, reason);
    }

    protected reset(): void {
        this.stack.set([]);
        this.log.set([]);
        this.returnFocus();
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (!this.stack().length) {
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            this.dismissTop('esc');
            return;
        }
        if (event.key === 'Tab') {
            // Lightweight focus trap inside the topmost layer.
            const el = this.layerEl(this.top()!.id);
            const focusables = Array.from(el?.querySelectorAll<HTMLElement>('button, [tabindex]') ?? []);
            if (!focusables.length) {
                return;
            }
            event.preventDefault();
            const current = focusables.indexOf(document.activeElement as HTMLElement);
            const next = event.shiftKey
                ? current <= 0
                    ? focusables.length - 1
                    : current - 1
                : current >= focusables.length - 1
                  ? 0
                  : current + 1;
            focusables[next].focus();
        }
    }

    protected onStagePointer(event: PointerEvent): void {
        const t = this.top();
        if (!t) {
            return;
        }
        const target = event.target as Node;
        // A press inside the topmost layer is "inside" — never dismisses.
        if (this.layerEl(t.id)?.contains(target)) {
            return;
        }
        if (t.type === 'menu') {
            // Outside a non-modal layer → dismiss exactly one level.
            this.dismissTop('outside');
        } else if (target === this.backdropRef().nativeElement) {
            // For a modal only the backdrop counts as "outside".
            this.dismissTop('outside');
        }
    }

    private layerEl(id: LayerDef['id']): HTMLElement | undefined {
        return { dialog: this.dialogRef(), menu: this.menuRef(), submenu: this.submenuRef() }[id]?.nativeElement;
    }

    private focusFirst(container: HTMLElement | undefined): void {
        container?.querySelector<HTMLElement>('button, [tabindex]')?.focus();
    }

    private returnFocus(): void {
        const top = this.top();
        if (top) {
            this.focusFirst(this.layerEl(top.id));
            return;
        }
        this.deleteBtnRef().nativeElement.focus();
    }

    private flash(id: LayerDef['id']): void {
        this.flashId.set(id);
        setTimeout(() => {
            if (this.flashId() === id) {
                this.flashId.set(null);
            }
        }, 260);
    }

    private pulse(key: 'dismiss' | 'scroll' | 'focus'): void {
        this.pulsing.update((s) => new Set(s).add(key));
        setTimeout(() => {
            this.pulsing.update((s) => {
                const next = new Set(s);
                next.delete(key);
                return next;
            });
        }, 480);
    }

    private logEvent(kind: LogEntry['kind'], text: string): void {
        this.log.update((entries) => [{ kind, text }, ...entries].slice(0, 8));
    }
}
```

This demo is a self-contained simulation of how those engines coordinate; the real behavior is composed
from `RdxDismissableLayer` plus the scroll-lock and focus-manager primitives.

### Nested Layers

Only the topmost layer responds to Escape. Open several children and close them one by one.

```html
<section class="flex w-2xl flex-col gap-4">
    <div>
        <h3 class="text-base font-semibold">Nested layers</h3>
        <p class="text-muted-foreground mt-1 text-sm leading-6">
            Open several children, then press Escape. Layers close one at a time, starting with the topmost
            layer.
        </p>
    </div>
    <dismissable-nested />
</section>
```

### Branch

Use `rdxDismissableLayerBranch` for detached controls that should behave as part of the layer even though they are
outside its DOM subtree.

```html
<dismissable-branch />
```

### Focus Trap

Combine a dismissable layer with Focus Scope when keyboard focus must stay inside the active surface.

```html
<dismissable-focus-trap />
```

### Dialog

Dialogs commonly combine a portal, focus guards, Focus Scope, a backdrop, and a dismissable layer.

```html
<section class="flex max-w-xl flex-col gap-4">
    <div class="border-border bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
        <h3 class="text-foreground mb-2 text-sm font-semibold">Dialog behavior</h3>
        <ul class="text-muted-foreground ml-4 list-disc space-y-1 text-sm leading-5">
            <li>Focus moves inside the dialog when mounted.</li>
            <li>Focus is trapped inside the dialog.</li>
            <li>Scrolling and outside interaction are disabled.</li>
            <li>Escape or an outside interaction dismisses the dialog.</li>
            <li>Focus returns to the open button after dismiss.</li>
        </ul>
    </div>
    <dummy-dialog />
</section>
```

### Popover

Popovers combine positioning with optional focus trapping and optional outside pointer event blocking.

```html
<section class="flex max-w-xl flex-col gap-4">
    <div class="border-border bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
        <h3 class="text-foreground mb-2 text-sm font-semibold">Popover behavior</h3>
        <ul class="text-muted-foreground ml-4 list-disc space-y-1 text-sm leading-5">
            <li>Focus moves inside the popover when mounted.</li>
            <li>The controls can enable focus trapping and block outside pointer events.</li>
            <li>Escape or an outside interaction dismisses the popover.</li>
            <li>Focus returns to the open button after dismiss.</li>
        </ul>
    </div>
    <dummy-popover [disableOutsidePointerEvents]="disableOutsidePointerEvents" [trapped]="trapped" />
</section>
```

## API Reference

### Layer
