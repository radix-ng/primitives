import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    isDevMode
} from '@angular/core';
import { RdxCompositeItem } from '@radix-ng/primitives/composite';
import { BooleanInput, dispatchClickWithModifiers, injectId, rdxDevWarning } from '@radix-ng/primitives/core';
import { provideTabsCompositeItemOwner } from './tabs-composite-item-owner';
import { injectTabsRootContext } from './tabs-root-context';
import { RdxTabsValue } from './utils';

/**
 * An individual interactive tab button that activates its corresponding panel.
 *
 * @see https://base-ui.com/react/components/tabs
 */
@Directive({
    selector: '[rdxTabsTab]',
    exportAs: 'rdxTabsTab',
    hostDirectives: [RdxCompositeItem],
    providers: [provideTabsCompositeItemOwner()],
    host: {
        '[attr.type]': 'nativeButton() ? "button" : undefined',
        role: 'tab',
        '[attr.id]': 'tabId()',
        '[attr.aria-selected]': 'active()',
        '[attr.aria-controls]': 'panelId()',
        '[attr.aria-disabled]': 'disabled() ? "true" : nativeButton() ? "false" : undefined',
        '[attr.disabled]': 'undefined',
        '[attr.data-composite-item-active]': 'active() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()',
        '[attr.data-active]': 'active() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp($event)',
        '(pointerdown)': 'onPointerDown($event)',
        '(focusin)': 'onFocus($event)'
    }
})
export class RdxTabsTab {
    protected readonly rootContext = injectTabsRootContext();
    private readonly compositeItem = inject(RdxCompositeItem, { self: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly generatedId = injectId(`${this.rootContext.baseId}-tab-`);

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
     * Whether the host element is a native button. Native Enter activation stays with the browser.
     * Set to `false` for other hosts; links keep native Enter navigation and other hosts receive keyboard clicks.
     *
     * @default true
     */
    readonly nativeButton = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * Optional native tab id. Defaults to an SSR-stable id unique to this tab instance.
     */
    readonly id = input<string | undefined>(undefined);

    /** @ignore */
    protected readonly tabId = computed(() => this.id() ?? this.generatedId);
    /** @ignore */
    protected readonly panelId = computed(() => this.rootContext.getPanelId(this.value()));

    /** @ignore */
    protected readonly active = computed(() => this.rootContext.value() === this.value());

    private isPressing = false;
    private isMainButton = false;
    private releasePress?: () => void;

    constructor() {
        inject(DestroyRef).onDestroy(() => this.releasePress?.());
        if (isDevMode()) {
            // Stays silent while no list is registered — a list behind `@if`, or tabs projected into a
            // list that has not rendered yet, are both legitimate. Once a list exists, a tab outside it
            // is misuse: composite registration is gated on DOM containment.
            afterRenderEffect(() => {
                const listContext = this.rootContext.tabCompositeList();

                if (listContext && !listContext.listElement.contains(this.elementRef.nativeElement)) {
                    rdxDevWarning(
                        'tabs/tab-outside-list',
                        '`rdxTabsTab` is rendered outside its `rdxTabsList`, so it gets no roving tabindex, ' +
                            'arrow keys cannot reach it, and its `role="tab"` sits outside the `role="tablist"`. ' +
                            'Move the tab inside the list, or project it there with `<ng-content>`.',
                        'components/tabs'
                    );
                }
            });
        }

        effect(() => {
            this.compositeItem.setMetadata({
                disabled: this.disabled(),
                id: this.tabId(),
                value: this.value()
            });
        });
        effect((onCleanup) => onCleanup(this.rootContext.registerTab(this.value(), this.tabId())));
    }

    /** @ignore */
    protected onClick(event: MouseEvent): void {
        if (this.disabled()) {
            event.preventDefault();
            return;
        }
        if (this.active()) {
            return;
        }

        this.rootContext.setValue(this.value(), event, 'none');
    }

    /** @ignore */
    protected onKeyDown(event: KeyboardEvent): void {
        if (this.disabled()) {
            // Keep Tab available and let Composite process navigation keys after suppressing defaults.
            if (event.key !== 'Tab') event.preventDefault();
            return;
        }
        const element = this.elementRef.nativeElement;
        if (event.target !== element) return;

        if (event.key === ' ') {
            // A composite activates Space on keydown; the click keeps native event/modifier semantics.
            event.preventDefault();
            dispatchClickWithModifiers(element, event);
        } else if (
            event.key === 'Enter' &&
            !this.nativeButton() &&
            !(element.tagName === 'A' && element.hasAttribute('href')) &&
            !event.defaultPrevented
        ) {
            event.preventDefault();
            dispatchClickWithModifiers(element, event);
        }
    }

    /** @ignore */
    protected onKeyUp(event: KeyboardEvent): void {
        if (
            !this.disabled() &&
            this.nativeButton() &&
            this.elementRef.nativeElement.tagName === 'BUTTON' &&
            event.target === this.elementRef.nativeElement &&
            event.key === ' '
        )
            event.preventDefault();
    }

    /** @ignore */
    protected onPointerDown(event: PointerEvent): void {
        if (this.disabled()) {
            event.preventDefault();
            return;
        }
        if (this.active()) {
            return;
        }

        this.releasePress?.();
        this.isPressing = true;
        this.isMainButton = event.button === 0;

        const ownerDocument = this.elementRef.nativeElement.ownerDocument;
        const endPress = () => {
            this.isPressing = false;
            this.isMainButton = false;
            ownerDocument.removeEventListener('pointerup', endPress);
            ownerDocument.removeEventListener('pointercancel', endPress);
            this.releasePress = undefined;
        };
        this.releasePress = endPress;
        ownerDocument.addEventListener('pointerup', endPress);
        ownerDocument.addEventListener('pointercancel', endPress);
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
