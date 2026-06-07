import { isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    PLATFORM_ID,
    untracked
} from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRovingFocusGroupContext } from './roving-focus-group.directive';
import { focusFirst, generateId, getFocusIntent, wrapArray } from './utils';

/**
 * @group Components
 */
@Directive({
    selector: '[rdxRovingFocusItem]',
    host: {
        '[attr.tabindex]': 'tabindex()',
        '[attr.data-orientation]': 'rootContext?.orientation()',
        '[attr.data-active]': 'active() ? "true" : undefined',
        '[attr.data-disabled]': '!focusable() ? "" : undefined',
        '(mousedown)': 'handleMouseDown($event)',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'onFocus()'
    }
})
export class RdxRovingFocusItemDirective {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly elementRef = inject(ElementRef);

    /**
     * The enclosing roving-focus group. Optional: when the item is used outside a group
     * (e.g. a standalone Toggle), it degrades to a plain element and does not manage focus.
     */
    protected readonly rootContext = injectRovingFocusGroupContext(true);

    /**
     * When false, item will not be focusable.
     * @group Props
     */
    readonly focusableInput = input<boolean, BooleanInput>(true, { transform: booleanAttribute, alias: 'focusable' });

    /**
     * When `true`, marks the item as the active one, so it is preferred when focus enters the group.
     * @group Props
     */
    readonly activeInput = input<boolean, BooleanInput>(false, { transform: booleanAttribute, alias: 'active' });

    /**
     * @group Props
     */
    readonly tabStopIdInput = input<string>(undefined, { alias: 'tabStopId' });

    /**
     * When true, shift + arrow key will allow focusing on next/previous item.
     * @group Props
     */
    readonly allowShiftKey = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    // Stable fallback id, generated once so it never changes across recomputations of `id`.
    private readonly generatedId = generateId();
    protected readonly id = computed(() => this.tabStopId() || this.generatedId);
    protected readonly isCurrentTabStop = computed(() => this.rootContext?.currentTabStopId() === this.id());

    protected readonly focusable = linkedSignal(() => this.focusableInput());
    protected readonly active = linkedSignal(() => this.activeInput());
    private readonly tabStopId = linkedSignal(() => this.tabStopIdInput());

    /**
     * The roving tabindex. Without a group the item keeps its natural tab order (`null`); inside a
     * group exactly one focusable item is a tab stop (`0`), the rest are reachable only via arrows (`-1`).
     */
    protected readonly tabindex = computed(() => {
        if (!this.rootContext) {
            return null;
        }
        return this.focusable() && this.isCurrentTabStop() ? 0 : -1;
    });

    constructor() {
        // Keep the group's registry in sync with `focusable`, which can change after creation
        // (e.g. toolbar/navigation-menu toggle it via `setFocusable`). The cleanup also runs on
        // destroy, so a single effect covers register/unregister for the whole lifecycle.
        effect((onCleanup) => {
            const rootContext = this.rootContext;
            if (!rootContext || !this.focusable()) return;

            const element = this.elementRef.nativeElement;
            // `registerItem` reads and writes the group's `focusableItems` signal; calling it
            // untracked prevents the effect from depending on its own write and looping.
            const tabStopId = this.id();
            untracked(() => rootContext.registerItem(element, tabStopId));

            onCleanup(() => rootContext.unregisterItem(element, tabStopId));
        });
    }

    setFocusable(value: boolean) {
        this.focusable.set(value);
    }

    setActive(value: boolean) {
        this.active.set(value);
    }

    setTabStopId(value: string) {
        this.tabStopId.set(value);
    }

    /** @ignore */
    onFocus() {
        this.rootContext?.onItemFocus(this.id());
    }

    /** @ignore */
    handleMouseDown(event: Event) {
        if (!this.focusable()) {
            // We prevent focusing non-focusable items on `mousedown`.
            // Even though the item has tabIndex={-1}, that only means take it out of the tab order.
            event.preventDefault();
        } else {
            // Safari doesn't focus a button when clicked so we run our logic on mousedown also
            this.rootContext?.onItemFocus(this.id());
        }
    }

    /**
     * Handles the `keydown` event for keyboard navigation within the roving focus group.
     * Supports navigation based on orientation and direction, and focuses appropriate elements.
     *
     * @param event The `KeyboardEvent` object.
     * @ignore
     */
    handleKeydown(event: Event) {
        const rootContext = this.rootContext;
        if (!rootContext) return;

        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === 'Tab' && keyEvent.shiftKey) {
            rootContext.onItemShiftTab();
            return;
        }

        if (event.target !== this.elementRef.nativeElement) return;

        const focusIntent = getFocusIntent(keyEvent, rootContext.orientation(), rootContext.dir());

        if (focusIntent !== undefined) {
            if (
                keyEvent.metaKey ||
                keyEvent.ctrlKey ||
                keyEvent.altKey ||
                (this.allowShiftKey() ? false : keyEvent.shiftKey)
            ) {
                return;
            }

            event.preventDefault();

            let candidateNodes = rootContext.focusableItems().filter((item) => item.dataset['disabled'] !== '');

            if (focusIntent === 'last') {
                candidateNodes.reverse();
            } else if (focusIntent === 'prev' || focusIntent === 'next') {
                if (focusIntent === 'prev') candidateNodes.reverse();
                const currentIndex = candidateNodes.indexOf(this.elementRef.nativeElement);

                candidateNodes = rootContext.loop()
                    ? wrapArray(candidateNodes, currentIndex + 1)
                    : candidateNodes.slice(currentIndex + 1);
            }

            queueMicrotask(() => {
                if (this.isBrowser) {
                    const rootNode = this.elementRef.nativeElement.getRootNode() as Document | ShadowRoot;
                    focusFirst(candidateNodes, false, rootNode);
                }
            });
        }
    }
}
