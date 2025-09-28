import { BooleanInput } from '@angular/cdk/coercion';
import { isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    linkedSignal,
    PLATFORM_ID
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
        '[attr.data-active]': 'active()',
        '[attr.data-disabled]': '!focusable() ? "" : undefined',
        '(mousedown)': 'handleMouseDown($event)',
        '(keydown)': 'handleKeydown($event)',
        '(focus)': 'rootContext.onItemFocus(id())'
    }
})
export class RdxRovingFocusItemDirective {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly destroyRef = inject(DestroyRef);
    private readonly elementRef = inject(ElementRef);

    protected readonly rootContext = injectRovingFocusGroupContext()!;

    /**
     * When false, item will not be focusable.
     * @group Props
     */
    readonly focusableInput = input<boolean, BooleanInput>(true, { transform: booleanAttribute, alias: 'focusable' });

    /**
     * When `true`, item will be initially focused.
     * @group Props
     */
    readonly activeInput = input<boolean, BooleanInput>(true, { transform: booleanAttribute, alias: 'active' });

    /**
     * @group Props
     */
    readonly tabStopIdInput = input<string>(undefined, { alias: 'tabStopId' });

    /**
     * When true, shift + arrow key will allow focusing on next/previous item.
     * @group Props
     */
    readonly allowShiftKey = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly id = computed(() => this.tabStopId() || generateId());
    protected readonly isCurrentTabStop = computed(() => this.rootContext.currentTabStopId() === this.id());

    protected readonly focusable = linkedSignal(() => this.focusableInput());
    protected readonly active = linkedSignal(() => this.activeInput());
    private readonly tabStopId = linkedSignal(() => this.tabStopIdInput());

    constructor() {
        if (this.focusable()) {
            this.rootContext.registerItem(this.elementRef.nativeElement);
            this.rootContext.onFocusableItemAdd();

            this.destroyRef.onDestroy(() => {
                this.rootContext.unregisterItem(this.elementRef.nativeElement);
                this.rootContext.onFocusableItemRemove();
            });
        }
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
    handleMouseDown(event: MouseEvent) {
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
    handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Tab' && event.shiftKey) {
            this.rootContext.onItemShiftTab();
            return;
        }

        if (event.target !== this.elementRef.nativeElement) return;

        const focusIntent = getFocusIntent(event, this.rootContext.orientation(), this.rootContext.dir());

        if (focusIntent !== undefined) {
            if (event.metaKey || event.ctrlKey || event.altKey || (this.allowShiftKey() ? false : event.shiftKey)) {
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
                    focusFirst(candidateNodes, false, this.elementRef.nativeElement);
                }
            });
        }
    }
}
