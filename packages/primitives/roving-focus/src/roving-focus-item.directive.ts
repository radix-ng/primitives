import { BooleanInput } from '@angular/cdk/coercion';
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
import { injectRovingFocusGroupContext } from './roving-focus-group.directive';
import { focusFirst, generateId, getFocusIntent, wrapArray } from './utils';

/**
 * @group Components
 */
@Directive({
    selector: '[rdxRovingFocusItem]',
    host: {
        '[attr.tabindex]': 'isCurrentTabStop() ? 0 : -1',
        '[attr.data-orientation]': 'rootContext.orientation',
        '[attr.data-active]': 'active() ? "true" : undefined',
        '[attr.data-disabled]': '!focusable() ? "" : undefined',
        '(mousedown)': 'handleMouseDown($event)',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'rootContext.onItemFocus(id())'
    }
})
export class RdxRovingFocusItemDirective {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly elementRef = inject(ElementRef);

    protected readonly rootContext = injectRovingFocusGroupContext()!;

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
    protected readonly isCurrentTabStop = computed(() => this.rootContext.currentTabStopId() === this.id());

    protected readonly focusable = linkedSignal(() => this.focusableInput());
    protected readonly active = linkedSignal(() => this.activeInput());
    private readonly tabStopId = linkedSignal(() => this.tabStopIdInput());

    constructor() {
        // Keep the group's registry in sync with `focusable`, which can change after creation
        // (e.g. toolbar/navigation-menu toggle it via `setFocusable`). The cleanup also runs on
        // destroy, so a single effect covers register/unregister for the whole lifecycle.
        effect((onCleanup) => {
            if (!this.focusable()) return;

            const element = this.elementRef.nativeElement;
            // `registerItem` reads and writes the group's `focusableItems` signal; calling it
            // untracked prevents the effect from depending on its own write and looping.
            untracked(() => this.rootContext.registerItem(element));

            onCleanup(() => this.rootContext.unregisterItem(element));
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
    handleMouseDown(event: Event) {
        if (!this.focusable()) {
            // We prevent focusing non-focusable items on `mousedown`.
            // Even though the item has tabIndex={-1}, that only means take it out of the tab order.
            event.preventDefault();
        } else {
            // Safari doesn't focus a button when clicked so we run our logic on mousedown also
            this.rootContext.onItemFocus(this.id());
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
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === 'Tab' && keyEvent.shiftKey) {
            this.rootContext.onItemShiftTab();
            return;
        }

        if (event.target !== this.elementRef.nativeElement) return;

        const focusIntent = getFocusIntent(keyEvent, this.rootContext.orientation(), this.rootContext.dir());

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

            let candidateNodes = this.rootContext.focusableItems().filter((item) => item.dataset['disabled'] !== '');

            if (focusIntent === 'last') {
                candidateNodes.reverse();
            } else if (focusIntent === 'prev' || focusIntent === 'next') {
                if (focusIntent === 'prev') candidateNodes.reverse();
                const currentIndex = candidateNodes.indexOf(this.elementRef.nativeElement);

                candidateNodes = this.rootContext.loop()
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
