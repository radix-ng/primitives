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
        '[attr.type]': 'nativeButton() ? "button" : undefined',
        role: 'tab',
        '[attr.id]': 'tabId()',
        '[attr.aria-selected]': 'active()',
        '[attr.aria-controls]': 'panelId()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
        '[attr.disabled]': 'null',
        '[attr.data-composite-item-active]': 'active() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()',
        '[attr.data-active]': 'active() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)',
        '(pointerdown)': 'onPointerDown($event)',
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
     * Disabled tabs remain focusable during composite keyboard navigation, matching Base UI.
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the host element is a native button. When `true`, `type="button"` is applied.
     *
     * @default true
     */
    readonly nativeButton = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * Optional id for the tab element. When omitted, an id is derived from the root id and tab value.
     */
    readonly id = input<string | undefined>(undefined);

    /** @ignore */
    protected readonly tabId = computed(() => this.id() ?? makeTabId(this.rootContext.baseId, this.value()));
    /** @ignore */
    protected readonly panelId = computed(() => makePanelId(this.rootContext.baseId, this.value()));

    /** @ignore */
    protected readonly active = computed(() => this.rootContext.value() === this.value());

    private isPressing = false;
    private isMainButton = false;

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
    protected onClick(event: MouseEvent): void {
        if (this.active() || this.disabled()) {
            return;
        }

        this.rootContext.setValue(this.value(), event, 'none');
    }

    /** @ignore */
    protected onKeyDown(event: KeyboardEvent): void {
        if (!this.disabled() && (event.key === ' ' || event.key === 'Enter')) {
            this.rootContext.setValue(this.value(), event, 'none');
        }
    }

    /** @ignore */
    protected onPointerDown(event: PointerEvent): void {
        if (this.active() || this.disabled()) {
            return;
        }

        this.isPressing = true;
        this.isMainButton = event.button === 0;

        const ownerDocument = event.currentTarget instanceof HTMLElement ? event.currentTarget.ownerDocument : document;
        ownerDocument.addEventListener(
            'pointerup',
            () => {
                this.isPressing = false;
                this.isMainButton = false;
            },
            { once: true }
        );
        ownerDocument.addEventListener(
            'pointercancel',
            () => {
                this.isPressing = false;
                this.isMainButton = false;
            },
            { once: true }
        );
        ownerDocument.addEventListener(
            'blur',
            () => {
                this.isPressing = false;
                this.isMainButton = false;
            },
            { once: true }
        );
    }

    /** @ignore */
    protected onFocus(event: FocusEvent): void {
        if (this.active() || this.disabled()) {
            return;
        }

        if (this.rootContext.activateOnFocus() && (!this.isPressing || this.isMainButton)) {
            this.rootContext.setValue(this.value(), event, 'none');
        }
    }
}
