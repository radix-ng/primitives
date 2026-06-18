import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectTabsRootContext } from './tabs-root-context';
import { makePanelId, makeTabId, RdxTabsValue } from './utils';

/**
 * An individual interactive tab button that activates its corresponding panel.
 *
 * @see https://base-ui.com/react/components/tabs
 */
@Directive({
    selector: '[rdxTabsTab]',
    exportAs: 'rdxTabsTab',
    hostDirectives: [RdxCompositeItem],
    host: {
        type: 'button',
        role: 'tab',
        '[id]': 'tabId()',
        '[attr.aria-selected]': 'active()',
        '[attr.aria-controls]': 'panelId()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.data-composite-item-active]': 'active() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()',
        '[attr.data-active]': 'active() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '(mousedown)': 'onMouseDown($event)',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'onFocus($event)'
    }
})
export class RdxTabsTab {
    protected readonly rootContext = injectTabsRootContext();
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });

    /**
     * A unique value that associates the tab with a panel.
     */
    readonly value = input.required<RdxTabsValue>();

    /**
     * When `true`, prevents the user from interacting with the tab.
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore */
    protected readonly tabId = computed(() => makeTabId(this.rootContext.baseId, this.value()));
    /** @ignore */
    protected readonly panelId = computed(() => makePanelId(this.rootContext.baseId, this.value()));

    /** @ignore */
    protected readonly active = computed(() => this.rootContext.value() === this.value());

    constructor() {
        effect(() => {
            this.compositeItem.setMetadata({
                disabled: this.disabled(),
                id: this.tabId(),
                value: this.value()
            });
        });
    }

    /** @ignore */
    protected onMouseDown(event: MouseEvent): void {
        // Only the primary button selects; ignore Ctrl-click (macOS right-click emulation).
        if (!this.disabled() && event.button === 0 && !event.ctrlKey) {
            this.rootContext.setValue(this.value(), event, 'trigger-press');
        } else {
            // Prevent focus to avoid accidental activation.
            event.preventDefault();
        }
    }

    /** @ignore */
    protected onKeyDown(event: KeyboardEvent): void {
        if (!this.disabled() && (event.key === ' ' || event.key === 'Enter')) {
            this.rootContext.setValue(this.value(), event, 'keyboard');
        }
    }

    /** @ignore */
    protected onFocus(event: FocusEvent): void {
        if (!this.active() && !this.disabled() && this.rootContext.activateOnFocus()) {
            this.rootContext.setValue(this.value(), event, 'focus');
        }
    }
}
