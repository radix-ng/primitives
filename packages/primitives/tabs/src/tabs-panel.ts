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
    untracked
} from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { useTransitionStatus } from '@radix-ng/primitives/core';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectTabsRootContext } from './tabs-root-context';
import { makePanelId, makeTabId, RdxTabsValue } from './utils';

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
        '[attr.data-hidden]': 'active() ? undefined : ""',
        '[attr.data-starting-style]': 'transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'transitionStatus() === "ending" ? "" : undefined',
        '[hidden]': 'hidden()'
    }
})
export class RdxTabsPanel {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly listItem = inject(RdxCompositeListItem, { self: true });
    protected readonly rootContext = injectTabsRootContext();

    /**
     * A unique value that associates the panel with a tab.
     */
    readonly value = input.required<RdxTabsValue>();

    /**
     * Keep the panel contents mounted in the DOM while inactive (the contents are still hidden).
     * Only relevant together with `*rdxTabsPanelPresence`, which otherwise unmounts them.
     *
     * @default false
     */
    readonly keepMounted = input(false, { transform: booleanAttribute });

    private readonly transition = useTransitionStatus(() => {});

    /** Reactive enter/exit transition phase (`'starting'` | `'ending'` | `undefined`). */
    readonly transitionStatus = this.transition.status;

    /** @ignore */
    protected readonly panelId = computed(() => makePanelId(this.rootContext.baseId, this.value()));
    /** @ignore */
    protected readonly tabId = computed(() => {
        const value = this.value();

        for (const tabMetadata of this.rootContext.tabMap().values()) {
            if (tabMetadata.value === value) {
                return tabMetadata.id;
            }
        }

        return makeTabId(this.rootContext.baseId, value);
    });

    /** Whether this panel's tab is currently selected. */
    readonly active = computed(() => this.rootContext.value() === this.value());

    /** `true` once a `*rdxTabsPanelPresence` child takes over mounting. */
    private readonly hasPresence = signal(false);

    /**
     * Whether the contents should be present for `*rdxTabsPanelPresence`. Flips with `active` so the
     * presence directive owns the exit-animation timing (it keeps the node mounted until its exit
     * `@keyframes` finishes); `keepMounted` keeps them mounted regardless.
     */
    readonly present = computed(() => this.keepMounted() || this.active());

    /**
     * The `hidden` attribute value. The panel is shown while active or while its exit transition
     * runs. When a presence child unmounts the contents we no longer force `hidden` (the empty
     * element renders nothing), unless `keepMounted` keeps the inactive contents around.
     */
    protected readonly hidden = computed(
        () => !this.active() && this.transitionStatus() !== 'ending' && (!this.hasPresence() || this.keepMounted())
    );

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

    /** @ignore Called by `RdxTabsPanelPresence` so the panel stops forcing `hidden`. */
    markHasPresence(): void {
        this.hasPresence.set(true);
    }
}
