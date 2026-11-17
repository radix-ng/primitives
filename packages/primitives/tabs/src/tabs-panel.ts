import { booleanAttribute, computed, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RdxCompositeListItem } from '@radix-ng/primitives/composite';
import { injectId, rdxDevError } from '@radix-ng/primitives/core';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { injectTabsPanelPresenceContext } from './tabs-panel-presence-context';
import { useTabsPanelTransition } from './tabs-panel-transition';
import { injectTabsRootContext } from './tabs-root-context';
import { RdxTabsValue } from './utils';

const UNSET_VALUE = Symbol('RdxTabsPanel.unsetValue');

const panelPresenceContext = () => ({ present: inject(RdxTabsPanel).present });

/**
 * A panel displayed when its corresponding tab is active.
 *
 * By default the panel stays in the DOM and is toggled with the `hidden` attribute. To unmount the
 * entire view while inactive, apply `*rdxTabsPanelPresence="value"` to the Panel host. That
 * structural owner supplies its value and waits for exit motion before destroying the view.
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
    private readonly presence = (() => {
        const presence = injectTabsPanelPresenceContext(true);
        return presence?.root === this.rootContext ? presence : null;
    })();
    private readonly generatedId = this.presence?.id ?? injectId(`${this.rootContext.baseId}-panel-`);

    /**
     * Associates an ordinary retained Panel with a Tab. With structural presence the value is
     * supplied by *rdxTabsPanelPresence instead. An explicitly bound undefined is a valid identity;
     * omitting both the binding and structural owner is diagnosed.
     */
    readonly valueInput = input<RdxTabsValue>(UNSET_VALUE, { alias: 'value' });

    /** The value supplied by the structural owner or the native Panel's value input. */
    readonly value = computed(() => {
        if (this.presence) return this.presence.value();
        const value = this.valueInput();
        if (value === UNSET_VALUE) {
            rdxDevError(
                'tabs/panel-value',
                'Supply a Panel value or wrap its host with *rdxTabsPanelPresence="value".',
                'components/tabs'
            );
        }
        return value;
    });

    /** Optional native panel id. Defaults to an SSR-stable id unique to this panel instance. */
    readonly id = input<string | undefined>(undefined);

    /**
     * Retained native Panel option. With structural presence, set `keepMounted` on the structural
     * template (`*rdxTabsPanelPresence="value; keepMounted: true"`) to retain the whole view.
     *
     * @default false
     */
    readonly keepMountedInput = input(false, { alias: 'keepMounted', transform: booleanAttribute });

    /** Effective mounting policy from the structural owner or native Panel. */
    readonly keepMounted = computed(() => (this.presence ? this.presence.keepMounted() : this.keepMountedInput()));

    private readonly transition = this.presence?.transition ?? useTabsPanelTransition(() => this.active()).transition;

    /** Reactive enter/exit transition phase (`'starting'` | `'ending'` | `undefined`). */
    readonly transitionStatus = computed(() => (this.presence?.exiting() ? 'ending' : this.transition.status()));

    /** @ignore */
    protected readonly panelId = computed(() => this.id() ?? this.generatedId);
    /** @ignore */
    protected readonly tabId = computed(() => this.rootContext.getTabId(this.value()));

    /** Whether this panel's tab is currently selected. */
    readonly active = computed(() => this.rootContext.value() === this.value());

    /**
     * Whether this panel is active or retained. The structural owner controls the entire view's
     * presence and waits for exit motion before destroying it.
     */
    readonly present = computed(() => this.keepMounted() || this.active());

    /**
     * The `hidden` attribute value. The panel is shown while active or while its exit transition
     * runs. A structural owner keeps its inactive Panel visible and inert until the whole view
     * is destroyed after exit completion.
     */
    protected readonly hidden = computed(() => !this.active() && this.transitionStatus() !== 'ending');

    /** @ignore Index of the panel in DOM order. */
    protected readonly index = this.listItem.index;

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
    }
}
