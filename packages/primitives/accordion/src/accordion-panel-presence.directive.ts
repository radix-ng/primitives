import { computed, Directive, effect, inject, input, signal } from '@angular/core';
import {
    injectCollapsibleRootContext,
    provideCollapsiblePanelOwnerContext,
    RdxCollapsiblePanelOwnerContext
} from '@radix-ng/primitives/collapsible';
import { providePresenceTargetContext, usePresence } from '@radix-ng/primitives/presence';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

/** Per-panel overrides. Undefined properties inherit the Root policy reactively. */
export interface RdxAccordionPanelOptions {
    keepMounted?: boolean;
    hiddenUntilFound?: boolean;
}

/**
 * Owns the entire Panel host and Angular children. Apply `*rdxAccordionPanelPresence` to the
 * `rdxAccordionPanel` host. To retain its view, use `{ keepMounted: true }` or set Root keepMounted.
 * The template and native host share the Item's existing render lifecycle.
 * @group Components
 */
@Directive({
    selector: 'ng-template[rdxAccordionPanelPresence]',
    providers: [
        provideCollapsiblePanelOwnerContext(() => inject(RdxAccordionPanelPresenceDirective).context),
        providePresenceTargetContext(() => inject(RdxAccordionPanelPresenceDirective).context.root.renderLifecycle)
    ]
})
export class RdxAccordionPanelPresenceDirective {
    private readonly root = injectAccordionRootContext();
    private readonly item = injectAccordionItemContext();
    private readonly collapsible = injectCollapsibleRootContext();

    /**
     * Optional per-panel mount/search overrides, including explicit false.
     * @group Props
     */
    readonly rdxAccordionPanelPresence = input<
        RdxAccordionPanelOptions | undefined,
        RdxAccordionPanelOptions | '' | undefined
    >(undefined, {
        transform: (options) => options || undefined
    });

    private readonly keepMounted = computed(
        () => this.rdxAccordionPanelPresence()?.keepMounted ?? this.root.keepMounted()
    );
    private readonly hiddenUntilFound = computed(
        () => this.rdxAccordionPanelPresence()?.hiddenUntilFound ?? this.root.hiddenUntilFound()
    );
    private readonly preventInitialOpenAnimation = signal(false, {
        debugName: 'RdxAccordionPanelPresence.preventInitialOpenAnimation'
    });

    /** @ignore Shared only with the native Panel rendered by this template. */
    readonly context: RdxCollapsiblePanelOwnerContext = {
        root: this.collapsible,
        keepMounted: this.keepMounted,
        hiddenUntilFound: this.hiddenUntilFound,
        preventInitialOpenAnimation: this.preventInitialOpenAnimation.asReadonly()
    };

    constructor() {
        let initialized = false;
        effect(() => {
            const open = this.item.open();
            if (!initialized) {
                initialized = true;
                this.preventInitialOpenAnimation.set(open);
            } else if (!open) {
                this.preventInitialOpenAnimation.set(false);
            }
        });
        usePresence(
            { present: this.item.open, renderLifecycle: this.collapsible.renderLifecycle },
            { keepMounted: () => this.keepMounted() || this.hiddenUntilFound() }
        );
    }
}
