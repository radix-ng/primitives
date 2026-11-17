import { booleanAttribute, computed, Directive, inject, input, linkedSignal } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { providePresenceTargetContext, usePresence } from '@radix-ng/primitives/presence';
import { provideTabsPanelPresenceContext, RdxTabsPanelPresenceContext } from './tabs-panel-presence-context';
import { useTabsPanelTransition } from './tabs-panel-transition';
import { injectTabsRootContext } from './tabs-root-context';
import { RdxTabsValue } from './utils';

/**
 * Owns the entire Panel view, including its native host and Angular children. Use
 * `<div *rdxTabsPanelPresence="'one'" rdxTabsPanel>...</div>` to remove an inactive panel after
 * its exit finishes. Add `keepMounted: true` to retain it. The value is inherited by rdxTabsPanel.
 */
@Directive({
    selector: 'ng-template[rdxTabsPanelPresence]',
    providers: [
        provideTabsPanelPresenceContext(() => inject(RdxTabsPanelPresence).context),
        providePresenceTargetContext(() => inject(RdxTabsPanelPresence).context.transition)
    ]
})
export class RdxTabsPanelPresence {
    private readonly root = injectTabsRootContext();
    private readonly motion = useTabsPanelTransition(() => this.active());
    private readonly transition = this.motion.transition;

    /** The value of the Panel owned by this template. */
    readonly rdxTabsPanelPresence = input.required<RdxTabsValue>();

    /** Keep the entire inactive Panel view mounted and hidden. */
    readonly keepMounted = input(false, { alias: 'rdxTabsPanelPresenceKeepMounted', transform: booleanAttribute });

    private readonly active = computed(() => this.root.value() === this.rdxTabsPanelPresence());
    // Hold a selection exit until the shared lifetime destroys the view. Dropping keepMounted
    // on an already-closed panel must not start another exit or reveal its hidden contents.
    private readonly exiting = linkedSignal({
        source: () => ({ active: this.active(), keepMounted: this.keepMounted() }),
        computation: (current, previous): boolean =>
            !current.active && !current.keepMounted && (previous?.source.active === true || previous?.value === true)
    });

    /** @ignore Shared only with the native Panel in this template and Root. */
    readonly context: RdxTabsPanelPresenceContext = {
        root: this.root,
        value: this.rdxTabsPanelPresence,
        keepMounted: this.keepMounted,
        exiting: this.exiting.asReadonly(),
        transition: this.transition,
        id: injectId(`${this.root.baseId}-panel-`)
    };

    constructor() {
        usePresence({ present: this.active, renderLifecycle: this.transition }, { keepMounted: this.keepMounted });
    }
}
