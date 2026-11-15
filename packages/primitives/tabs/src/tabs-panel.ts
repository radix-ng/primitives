import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    signal,
    Signal,
    untracked
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { injectId, useTransitionStatus } from '@radix-ng/primitives/core';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectTabsRootContext } from './tabs-root-context';
import { RdxTabsValue } from './utils';

const panelPresenceContext = () => ({ present: inject(RdxTabsPanel).present });

/**
 * A panel displayed when its corresponding tab is active.
 *
 * By default the panel stays in the DOM and is toggled with the `hidden` attribute. To unmount the
 * contents while inactive (Base UI's default `keepMounted: false`), nest a `*rdxTabsPanelPresence`
 * structural directive inside it; set `keepMounted` to keep the contents mounted regardless.
 *
 * @see https://base-ui.com/react/components/tabs
 */
@Directive({
    selector: '[rdxTabsPanel]',
    exportAs: 'rdxTabsPanel',
    providers: [provideRdxPresenceContext(panelPresenceContext)],
    hostDirectives: [RdxCompositeListItem],
    host: {
        role: 'tabpanel',
        '[attr.id]': 'panelId()',
        '[attr.tabindex]': 'active() ? 0 : -1',
        '[attr.aria-labelledby]': 'tabId()',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()',
        '[attr.data-index]': 'index()',
        '[attr.data-hidden]': 'hidden() ? "" : undefined',
        '[attr.inert]': 'active() ? undefined : ""',
        '[attr.data-starting-style]': 'transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'transitionStatus() === "ending" ? "" : undefined',
        '[hidden]': 'hidden()'
    }
})
export class RdxTabsPanel {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    protected readonly rootContext = injectTabsRootContext();
    private readonly generatedId = injectId(`${this.rootContext.baseId}-panel-`);

    /**
     * A unique value that associates the panel with a tab.
     */
    readonly value = input.required<RdxTabsValue>();

    /** Optional native panel id. Defaults to an SSR-stable id unique to this panel instance. */
    readonly id = input<string | undefined>(undefined);

    /**
     * Keep the panel contents mounted in the DOM while inactive (the contents are still hidden).
     * Only relevant together with `*rdxTabsPanelPresence`, which otherwise unmounts them.
     *
     * @default false
     */
    readonly keepMounted = input(false, { transform: booleanAttribute });

    private readonly transition = useTransitionStatus(() => {});

    /** Reactive enter/exit transition phase (`'starting'` | `'ending'` | `undefined`). */
    readonly transitionStatus = computed(() =>
        !this.active() && !this.keepMounted() && this.presences().some((mounted) => mounted())
            ? 'ending'
            : this.transition.status()
    );

    /** @ignore */
    protected readonly panelId = computed(() => this.id() ?? this.generatedId);
    /** @ignore */
    protected readonly tabId = computed(() => this.rootContext.getTabId(this.value()));

    /** Whether this panel's tab is currently selected. */
    readonly active = computed(() => this.rootContext.value() === this.value());

    /** The structural child owns content removal, including panel-host and descendant motion. */
    private readonly presences = signal<readonly Signal<boolean>[]>([]);

    /**
     * Whether the contents should be present for `*rdxTabsPanelPresence`. Flips with `active` so the
     * presence directive owns the exit-animation timing (it keeps the node mounted until its exit
     * `@keyframes` finishes); `keepMounted` keeps them mounted regardless.
     */
    readonly present = computed(() => this.keepMounted() || this.active());

    /**
     * The `hidden` attribute value. The panel is shown while active or while its exit transition
     * runs. A structural child keeps the panel visible until its actual contents have exited;
     * the retained empty host is hidden after removal as well.
     */
    protected readonly hidden = computed(() => !this.active() && this.transitionStatus() !== 'ending');

    /** @ignore Index of the panel in DOM order. */
    protected readonly index = this.listItem.index;

    private previousActive = false;
    private isFirstRun = true;

    constructor() {
        const unregister = this.transition.registerElement(this.elementRef.nativeElement);
        inject(DestroyRef).onDestroy(unregister);

        effect(() => {
            this.listItem.setMetadata({
                id: this.panelId(),
                value: this.value()
            });
        });

        effect((onCleanup) => {
            // Retained hosts re-register when shown/hidden, matching their native lifecycle.
            this.hidden();
            onCleanup(this.rootContext.registerPanel(this.value(), this.panelId()));
        });

        effect(() => {
            const active = this.active();

            // Settle the initial state without playing an enter transition.
            if (this.isFirstRun) {
                this.isFirstRun = false;
                this.previousActive = active;
                return;
            }

            if (active !== this.previousActive) {
                this.previousActive = active;
                untracked(() => this.transition.start(active));
            }
        });
    }

    /** @ignore Supplies the real motion root to the structural child's shared PresenceMachine. */
    registerPresence(mounted: Signal<boolean>): { element: HTMLElement; unregister: () => void } {
        this.presences.update((current) => [...current, mounted]);
        return {
            element: this.elementRef.nativeElement,
            unregister: () => this.presences.update((current) => current.filter((entry) => entry !== mounted))
        };
    }
}
