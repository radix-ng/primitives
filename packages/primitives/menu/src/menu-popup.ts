import { computed, DestroyRef, Directive, effect, ElementRef, inject, signal } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import {
    provideRdxDismissableLayerConfig,
    RdxDismissableLayer,
    RdxDismissableLayersContextToken
} from '@radix-ng/primitives/dismissable-layer';
import { provideRdxFocusScopeConfig, RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import { RdxPopperContent, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { injectRdxMenuRootContext } from './menu-root';

/** Selector for focusable menu items within the popup. */
const ITEM_SELECTOR = [
    '[rdxMenuItem]:not([data-disabled])',
    '[rdxMenuCheckboxItem]:not([data-disabled])',
    '[rdxMenuRadioItem]:not([data-disabled])',
    '[rdxMenuLinkItem]:not([data-disabled])',
    '[rdxMenuSubTrigger]:not([data-disabled])'
].join(',');

function getFocusableItems(popup: HTMLElement): HTMLElement[] {
    // Exclude items that belong to a nested child popup (submenu).
    return Array.from(popup.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
        (item) => item.closest('[rdxMenuPopup]') === popup
    );
}

/**
 * A container for the menu contents.
 */
@Directive({
    selector: '[rdxMenuPopup]',
    exportAs: 'rdxMenuPopup',
    hostDirectives: [RdxPopperContent, RdxDismissableLayer, RdxFocusScope],
    providers: [
        provideRdxDismissableLayerConfig(() => {
            const rootContext = injectRdxMenuRootContext()!;
            return {
                disableOutsidePointerEvents: computed(() => rootContext.modal())
            };
        }),
        provideRdxFocusScopeConfig(() => ({
            trapped: signal(false)
        }))
    ],
    host: {
        role: 'menu',
        tabindex: '-1',
        '[attr.aria-orientation]': 'rootContext.orientation()',
        '[attr.data-closed]': 'rootContext.isOpen() ? undefined : ""',
        '[attr.data-open]': 'rootContext.isOpen() ? "" : undefined',
        '[attr.data-state]': 'rootContext.isOpen() ? "open" : "closed"',
        '[attr.data-starting-style]': 'rootContext.transitionStatus() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'rootContext.transitionStatus() === "ending" ? "" : undefined',
        '[attr.data-align]': 'align()',
        '[attr.data-side]': 'side()',
        '(keydown)': 'handleKeydown($event)',
        '(rdx-menu-close-parent)': 'handleCloseParent($event)'
    }
})
export class RdxMenuPopup {
    protected readonly rootContext = injectRdxMenuRootContext()!;
    private readonly dismissableLayer = inject(RdxDismissableLayer);
    private readonly focusScope = inject(RdxFocusScope);
    private readonly wrapper = inject(RdxPopperContentWrapper, { optional: true });
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly dismissableLayersContext = inject(RdxDismissableLayersContextToken);
    private search = '';
    private searchTimer: ReturnType<typeof setTimeout> | undefined;

    protected readonly align = computed(() => this.wrapper?.placedAlign());
    protected readonly side = computed(() => this.wrapper?.placedSide());

    /**
     * Event handler called when the escape key is pressed. Can be prevented.
     */
    readonly escapeKeyDown = outputFromObservable(outputToObservable(this.dismissableLayer.escapeKeyDown));

    /**
     * Event handler called when a pointerdown event happens outside of the popup. Can be prevented.
     */
    readonly pointerDownOutside = outputFromObservable(outputToObservable(this.dismissableLayer.pointerDownOutside));

    /**
     * Event handler called when focus moves outside of the popup. Can be prevented.
     */
    readonly focusOutside = outputFromObservable(outputToObservable(this.dismissableLayer.focusOutside));

    /**
     * Event handler called when an interaction happens outside of the popup. Can be prevented.
     */
    readonly interactOutside = outputFromObservable(outputToObservable(this.dismissableLayer.interactOutside));

    /**
     * Event handler called before focus moves into the popup. Can be prevented.
     */
    readonly openAutoFocus = outputFromObservable(outputToObservable(this.focusScope.mountAutoFocus));

    /**
     * Event handler called before focus returns after the popup is removed. Can be prevented.
     */
    readonly closeAutoFocus = outputFromObservable(outputToObservable(this.focusScope.unmountAutoFocus));

    constructor() {
        const unregister = this.rootContext.registerTransitionElement(this.elementRef.nativeElement);
        inject(DestroyRef).onDestroy(() => {
            unregister();
            clearTimeout(this.searchTimer);
        });

        effect((onCleanup) => {
            if (!this.rootContext.isSubmenu()) {
                return;
            }

            const element = this.elementRef.nativeElement;
            this.dismissableLayersContext.branches.update((branches) => [...branches, element]);
            onCleanup(() => {
                this.dismissableLayersContext.branches.update((branches) =>
                    branches.filter((branch) => branch !== element)
                );
            });
        });

        this.dismissableLayer.dismiss.subscribe(() => {
            this.rootContext.close();
        });

        // Move focus into the popup when the menu opens — unless the opener suppressed it
        // (e.g. menubar hover-switching, where focus stays on the trigger).
        effect(() => {
            const autoFocus = this.rootContext.autoFocus();
            if (this.rootContext.isOpen() && autoFocus) {
                requestAnimationFrame(() => {
                    // `'popup'` focuses the container without highlighting an item (pointer opening).
                    if (autoFocus === 'popup') {
                        this.elementRef.nativeElement.focus({ preventScroll: true });
                        return;
                    }

                    const items = getFocusableItems(this.elementRef.nativeElement);
                    const item = autoFocus === 'last' ? items[items.length - 1] : items[0];
                    item?.focus({ preventScroll: true });
                });
            }
        });
    }

    protected handleCloseParent(event: Event): void {
        event.stopPropagation();
        this.rootContext.close();

        if (this.rootContext.isSubmenu() && this.rootContext.closeParentOnEsc()) {
            this.rootContext.closeParent();
        }
    }

    protected handleKeydown(event: KeyboardEvent): void {
        const el = this.elementRef.nativeElement;
        const items = getFocusableItems(el);
        const current = document.activeElement as HTMLElement;
        const currentIndex = items.indexOf(current);

        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault();
                event.stopPropagation();
                const atEnd = currentIndex >= items.length - 1;
                const next = atEnd
                    ? this.rootContext.loopFocus()
                        ? items[0]
                        : items[items.length - 1]
                    : items[currentIndex + 1];
                next?.focus({ preventScroll: true });
                break;
            }
            case 'ArrowUp': {
                event.preventDefault();
                event.stopPropagation();
                const atStart = currentIndex <= 0;
                const prev = atStart
                    ? this.rootContext.loopFocus()
                        ? items[items.length - 1]
                        : items[0]
                    : items[currentIndex - 1];
                prev?.focus({ preventScroll: true });
                break;
            }
            case 'Home': {
                event.preventDefault();
                event.stopPropagation();
                items[0]?.focus({ preventScroll: true });
                break;
            }
            case 'End': {
                event.preventDefault();
                event.stopPropagation();
                items[items.length - 1]?.focus({ preventScroll: true });
                break;
            }
            case 'ArrowLeft': {
                const trigger = this.rootContext.trigger();
                if (!trigger?.hasAttribute('rdxMenuSubTrigger')) {
                    if (this.rootContext.handlePopupArrowNavigation(-1)) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    break;
                }

                // Close this popup and return focus to the trigger (used by submenus).
                event.preventDefault();
                event.stopPropagation();
                this.rootContext.close();
                trigger.focus({ preventScroll: true });
                break;
            }
            case 'ArrowRight': {
                if (this.rootContext.handlePopupArrowNavigation(1)) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            case 'Escape': {
                event.preventDefault();
                event.stopPropagation();
                this.rootContext.close();
                if (this.rootContext.isSubmenu() && this.rootContext.closeParentOnEsc()) {
                    this.rootContext.closeParent();
                }
                this.rootContext.trigger()?.focus({ preventScroll: true });
                break;
            }
            case 'Tab': {
                // Close on tab to allow natural tab navigation
                this.rootContext.close();
                break;
            }
            default: {
                // Typeahead
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                    const char = event.key.toLowerCase();
                    this.search += char;
                    clearTimeout(this.searchTimer);
                    this.searchTimer = setTimeout(() => {
                        this.search = '';
                        this.searchTimer = undefined;
                    }, 1000);

                    const query =
                        this.search.length > 1 && [...this.search].every((c) => c === char) ? char : this.search;
                    const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
                    const rotated = [...items.slice(startIndex), ...items.slice(0, startIndex)];
                    const match = rotated.find((item) => {
                        const text = (item.dataset['label'] ?? item.textContent?.trim() ?? '').toLowerCase();
                        return text.startsWith(query);
                    });
                    match?.focus({ preventScroll: true });
                }
                break;
            }
        }
    }
}
