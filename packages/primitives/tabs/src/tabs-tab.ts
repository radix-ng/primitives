import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
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
    hostDirectives: [
        {
            directive: RdxRovingFocusItemDirective,
            inputs: ['allowShiftKey']
        }
    ],
    host: {
        type: 'button',
        role: 'tab',
        '[id]': 'tabId()',
        '[attr.aria-selected]': 'active()',
        '[attr.aria-controls]': 'panelId()',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()',
        '[attr.data-active]': 'active() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '(mousedown)': 'onMouseDown($event)',
        '(keydown)': 'onKeyDown($event)',
        '(focus)': 'onFocus()'
    }
})
export class RdxTabsTab {
    protected readonly rootContext = injectTabsRootContext();
    private readonly rovingFocusItem = inject(RdxRovingFocusItemDirective);

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
            this.rovingFocusItem.setActive(this.active());
            this.rovingFocusItem.setFocusable(!this.disabled());
        });
    }

    /** @ignore */
    protected onMouseDown(event: MouseEvent): void {
        // Only the primary button selects; ignore Ctrl-click (macOS right-click emulation).
        if (!this.disabled() && event.button === 0 && !event.ctrlKey) {
            this.rootContext.setValue(this.value());
        } else {
            // Prevent focus to avoid accidental activation.
            event.preventDefault();
        }
    }

    /** @ignore */
    protected onKeyDown(event: KeyboardEvent): void {
        if (!this.disabled() && (event.key === ' ' || event.key === 'Enter')) {
            this.rootContext.setValue(this.value());
        }
    }

    /** @ignore */
    protected onFocus(): void {
        if (!this.active() && !this.disabled() && this.rootContext.activateOnFocus()) {
            this.rootContext.setValue(this.value());
        }
    }
}
