import {
    afterNextRender,
    AfterRenderRef,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    Injector,
    input,
    model,
    ModelSignal,
    output,
    OutputRef,
    signal,
    Signal,
    untracked,
    WritableSignal
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    injectId,
    RdxCancelableChangeEventDetails,
    RdxRenderLifecycle,
    RdxTransitionStatus,
    useRenderLifecycle
} from '@radix-ng/primitives/core';

export type RdxCollapsibleState = 'open' | 'closed';
export type RdxCollapsibleOpenChangeReason = 'trigger-press' | 'none';
export type RdxCollapsibleOpenChangeEventDetails = RdxCancelableChangeEventDetails<RdxCollapsibleOpenChangeReason>;
export interface RdxCollapsibleOpenChangeEvent {
    open: boolean;
    eventDetails: RdxCollapsibleOpenChangeEventDetails;
}

export interface CollapsibleRootContext {
    /** Stable id linking the trigger's `aria-controls` to the panel. */
    panelId: Signal<string | undefined>;
    /** Writable so composing primitives (Accordion) can drive the state. */
    open: ModelSignal<boolean>;
    disabled: Signal<boolean>;
    /** Open/close transition phase, for `data-starting-style` / `data-ending-style`. */
    transitionStatus: Signal<RdxTransitionStatus>;
    /** `true` while the panel should stay rendered: open, or running its exit transition. */
    mounted: Signal<boolean>;
    /** @internal Shared with a structural Panel owner; it must not start another motion observer. */
    renderLifecycle: RdxRenderLifecycle;
    /** @internal Completion of the shared motion observation, including open animations. */
    onOpenChangeComplete: OutputRef<boolean>;
    /** @internal Settle a close immediately when its Panel has no finite motion. */
    finishClose: () => void;
    /**
     * Composition fallbacks supplied by Accordion. Panel inputs override these reactively without
     * writing into the fallback, so removing an override restores inheritance.
     */
    keepMounted: WritableSignal<boolean>;
    hiddenUntilFound: WritableSignal<boolean>;
    toggle: (event: Event, trigger?: HTMLElement) => void;
    setOpen: (open: boolean, reason: RdxCollapsibleOpenChangeReason, event: Event, trigger?: HTMLElement) => boolean;
    setPanelIdState: (id: string | null | undefined) => void;
    /** Registers the panel element whose transition duration gates the close completion. */
    registerTransitionElement: (element: HTMLElement) => () => void;
    /** @internal Composing owners route requests through their authoritative state transaction. */
    registerOpenRequestHandler: (handler: CollapsibleOpenRequestHandler) => () => void;
}

type CollapsibleOpenRequestHandler = (
    open: boolean,
    reason: RdxCollapsibleOpenChangeReason,
    event: Event,
    trigger?: HTMLElement
) => boolean;

export const [injectCollapsibleRootContext, provideCollapsibleRootContext] = createContext<CollapsibleRootContext>(
    'CollapsibleRootContext',
    'components/collapsible'
);

const rootContext = (): CollapsibleRootContext => {
    const instance = inject(RdxCollapsibleRootDirective);

    return {
        panelId: instance.resolvedPanelId,
        open: instance.open,
        disabled: instance.disabled,
        transitionStatus: instance.transitionStatus,
        mounted: instance.mounted,
        renderLifecycle: instance.renderLifecycle,
        onOpenChangeComplete: instance.onOpenChangeComplete,
        finishClose: () => instance.finishClose(),
        keepMounted: instance.keepMountedContext,
        hiddenUntilFound: instance.hiddenUntilFoundContext,
        setOpen: (open, reason, event, trigger) => instance.setOpen(open, reason, event, trigger),
        setPanelIdState: (id) => instance.setPanelIdState(id),
        registerTransitionElement: (element) => instance.registerTransitionElement(element),
        registerOpenRequestHandler: (handler) => instance.registerOpenRequestHandler(handler),
        toggle: (event, trigger) => {
            if (instance.disabled()) {
                return;
            }

            instance.setOpen(!instance.open(), 'trigger-press', event, trigger);
        }
    };
};

/**
 * Groups all parts of the collapsible.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxCollapsibleRoot]',
    exportAs: 'rdxCollapsibleRoot',
    providers: [provideCollapsibleRootContext(rootContext)],
    host: {
        '[attr.data-open]': 'open() ? "" : undefined',
        '[attr.data-closed]': 'open() ? undefined : ""',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxCollapsibleRootDirective {
    private readonly transition = useRenderLifecycle((open) => this.onOpenChangeComplete.emit(open), {
        open: () => this.open()
    });

    /** @internal The structural Panel view consumes the same lifetime as its native host. */
    readonly renderLifecycle = this.transition;

    private readonly injector = inject(Injector);
    private readonly closeFramePending = signal(false);
    private closeRender?: AfterRenderRef;
    private closeFrame?: number;

    private readonly generatedPanelId = injectId('rdx-collapsible-panel-');
    private readonly panelIdState = signal<string | null | undefined>(undefined);

    /** Reactive open/close transition phase (`'starting'` | `'ending'` | `undefined`). */
    readonly transitionStatus = this.transition.status;

    /** Registers the panel element whose transition duration gates the close completion. */
    readonly registerTransitionElement = this.transition.registerElement;

    /**
     * The controlled open state of the collapsible.
     * `true` - expanded, `false` - collapsed.
     *
     * @group Props
     * @defaultValue false
     */
    readonly open = model<boolean>(false);

    /**
     * The open state of the collapsible when it is initially rendered.
     * Use when you do not need to control its open state.
     *
     * @group Props
     * @defaultValue false
     */
    readonly defaultOpen = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the component should ignore user interaction.
     *
     * @group Props
     * @defaultValue false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Stable id linking the trigger's `aria-controls` to the panel. */
    readonly panelId = input<string | undefined>(undefined);

    /** Stable id linking the trigger's `aria-controls` to the panel. */
    readonly resolvedPanelId = computed(() =>
        this.panelIdState() === null ? undefined : (this.panelIdState() ?? this.panelId() ?? this.generatedPanelId)
    );

    /** Composition fallbacks (see {@link CollapsibleRootContext}). Default `false`. */
    readonly keepMountedContext = signal(false);
    readonly hiddenUntilFoundContext = signal(false);

    /** `true` while the panel must stay rendered: open, or mid exit transition. */
    readonly mounted = computed(() => this.open() || this.closeFramePending() || this.transitionStatus() === 'ending');

    /**
     * Event handler called when the open state of the collapsible changes.
     *
     * @group Emits
     */
    readonly onOpenChange = output<RdxCollapsibleOpenChangeEvent>();

    /**
     * Event handler called after the open/close transition has finished.
     *
     * @group Emits
     */
    readonly onOpenChangeComplete = output<boolean>();

    private hasAppliedDefaultOpen = false;
    private previousOpen = this.open();
    private openRequestHandler?: CollapsibleOpenRequestHandler;

    /** @internal A composition adapter; standalone Collapsible keeps its own request handling. */
    registerOpenRequestHandler(handler: CollapsibleOpenRequestHandler): () => void {
        this.openRequestHandler = handler;
        return () => {
            if (this.openRequestHandler === handler) this.openRequestHandler = undefined;
        };
    }

    private cancelCloseFrame(): void {
        this.closeRender?.destroy();
        this.closeRender = undefined;
        if (this.closeFrame !== undefined) cancelAnimationFrame(this.closeFrame);
        this.closeFrame = undefined;
        this.closeFramePending.set(false);
    }

    /** @internal The native Panel can prove that there is no exit motion to observe. */
    finishClose(): void {
        if (this.open()) return;
        this.cancelCloseFrame();
        this.transition.unmount();
        this.onOpenChangeComplete.emit(false);
    }

    setPanelIdState(id: string | null | undefined): void {
        this.panelIdState.set(id);
    }

    setOpen(nextOpen: boolean, reason: RdxCollapsibleOpenChangeReason, event: Event, trigger?: HTMLElement): boolean {
        if (this.openRequestHandler) return this.openRequestHandler(nextOpen, reason, event, trigger);
        if (nextOpen === this.open()) {
            return true;
        }

        const { eventDetails } = createCancelableChangeEventDetails(reason, event, trigger);

        this.onOpenChange.emit({ open: nextOpen, eventDetails });

        if (eventDetails.isCanceled()) {
            return false;
        }

        untracked(() => {
            this.open.set(nextOpen);
        });

        return true;
    }

    constructor() {
        inject(DestroyRef).onDestroy(() => this.cancelCloseFrame());
        effect(() => {
            const defaultOpen = this.defaultOpen();

            if (!this.hasAppliedDefaultOpen && defaultOpen) {
                this.hasAppliedDefaultOpen = true;
                untracked(() => {
                    this.open.set(true);
                    // Treat an initially-open collapsible as settled so it doesn't play an
                    // enter transition on first render.
                    this.previousOpen = true;
                });
            }
        });

        effect(() => {
            const open = this.open();

            if (open !== this.previousOpen) {
                this.previousOpen = open;
                untracked(() => {
                    this.cancelCloseFrame();
                    if (open) {
                        this.transition.start(true);
                        return;
                    }
                    // Capture the expanded pixel size before data-ending-style applies the
                    // collapsed layout. Use the existing lifecycle to observe the resulting exit.
                    this.closeFramePending.set(true);
                    this.closeRender = afterNextRender(
                        () => {
                            this.closeRender = undefined;
                            this.closeFrame = requestAnimationFrame(() => {
                                this.closeFrame = undefined;
                                this.closeFramePending.set(false);
                                this.transition.start(false);
                            });
                        },
                        { injector: this.injector }
                    );
                });
            }
        });
    }
}
