import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    ModelSignal,
    output,
    Signal,
    signal,
    untracked,
    WritableSignal
} from '@angular/core';
import {
    BooleanInput,
    createCancelableChangeEventDetails,
    createContext,
    injectId,
    RdxCancelableChangeEventDetails,
    RdxTransitionStatus,
    useTransitionStatus
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
    panelId: Signal<string>;
    /** Writable so composing primitives (Accordion) can drive the state. */
    open: ModelSignal<boolean>;
    disabled: Signal<boolean>;
    /** Open/close transition phase, for `data-starting-style` / `data-ending-style`. */
    transitionStatus: Signal<RdxTransitionStatus>;
    /** `true` while the panel should stay rendered: open, or running its exit transition. */
    mounted: Signal<boolean>;
    /**
     * Composition fallbacks. The standalone Panel inputs write here, and Accordion writes here
     * directly; the Panel reads these so both wiring paths converge on a single source of truth.
     */
    keepMounted: WritableSignal<boolean>;
    hiddenUntilFound: WritableSignal<boolean>;
    toggle: (event: Event, trigger?: HTMLElement) => void;
    setOpen: (open: boolean, reason: RdxCollapsibleOpenChangeReason, event: Event, trigger?: HTMLElement) => boolean;
    setPanelIdState: (id: string | undefined) => void;
    /** Registers the panel element whose transition duration gates the close completion. */
    registerTransitionElement: (element: HTMLElement) => () => void;
}

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
        keepMounted: instance.keepMountedContext,
        hiddenUntilFound: instance.hiddenUntilFoundContext,
        setOpen: (open, reason, event, trigger) => instance.setOpen(open, reason, event, trigger),
        setPanelIdState: (id) => instance.setPanelIdState(id),
        registerTransitionElement: (element) => instance.registerTransitionElement(element),
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
    private readonly transition = useTransitionStatus((open) => this.onOpenChangeComplete.emit(open));

    private readonly generatedPanelId = injectId('rdx-collapsible-panel-');
    private readonly panelIdState = signal<string | undefined>(undefined);

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
    readonly resolvedPanelId = computed(() => this.panelIdState() ?? this.panelId() ?? this.generatedPanelId);

    /** Composition fallbacks (see {@link CollapsibleRootContext}). Default `false`. */
    readonly keepMountedContext = signal(false);
    readonly hiddenUntilFoundContext = signal(false);

    /** `true` while the panel must stay rendered: open, or mid exit transition. */
    readonly mounted = computed(() => this.open() || this.transitionStatus() === 'ending');

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

    setPanelIdState(id: string | undefined): void {
        this.panelIdState.set(id);
    }

    setOpen(nextOpen: boolean, reason: RdxCollapsibleOpenChangeReason, event: Event, trigger?: HTMLElement): boolean {
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
                untracked(() => this.transition.start(open));
            }
        });
    }
}
