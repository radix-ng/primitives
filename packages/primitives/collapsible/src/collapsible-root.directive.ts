import { _IdGenerator } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
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
    signal,
    Signal,
    untracked,
    WritableSignal
} from '@angular/core';
import { createContext, RdxTransitionStatus, useTransitionStatus } from '@radix-ng/primitives/core';

export type RdxCollapsibleState = 'open' | 'closed';

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
    toggle: () => void;
    /** Registers the panel element whose transition duration gates the close completion. */
    registerTransitionElement: (element: HTMLElement) => () => void;
}

export const [injectCollapsibleRootContext, provideCollapsibleRootContext] =
    createContext<CollapsibleRootContext>('CollapsibleRootContext');

const rootContext = (): CollapsibleRootContext => {
    const instance = inject(RdxCollapsibleRootDirective);

    return {
        panelId: instance.panelId,
        open: instance.open,
        disabled: instance.disabled,
        transitionStatus: instance.transitionStatus,
        mounted: instance.mounted,
        keepMounted: instance.keepMountedContext,
        hiddenUntilFound: instance.hiddenUntilFoundContext,
        registerTransitionElement: (element) => instance.registerTransitionElement(element),
        toggle: () => {
            if (instance.disabled()) {
                return;
            }

            untracked(() => {
                instance.open.set(!instance.open());
            });

            instance.onOpenChange.emit(instance.open());
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
    readonly panelId = input<string>(inject(_IdGenerator).getId('rdx-collapsible-panel-'));

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
    readonly onOpenChange = output<boolean>();

    /**
     * Event handler called after the open/close transition has finished.
     *
     * @group Emits
     */
    readonly onOpenChangeComplete = output<boolean>();

    private hasAppliedDefaultOpen = false;
    private previousOpen = this.open();

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
