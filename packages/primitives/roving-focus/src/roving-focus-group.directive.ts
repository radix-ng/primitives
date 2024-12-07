import {
    booleanAttribute,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    Output,
    signal
} from '@angular/core';
import { Direction, ENTRY_FOCUS, EVENT_OPTIONS, focusFirst, Orientation } from './utils';

@Directive({
    selector: '[rdxRovingFocusGroup]',
    standalone: true,
    host: {
        '[attr.data-orientation]': 'dataOrientation',
        '[attr.tabindex]': 'tabIndex',
        '(focus)': 'handleFocus($event)',
        '(mouseup)': 'handleMouseUp()',
        '(mousedown)': 'handleMouseDown()',
        style: 'outline: none;'
    }
})
export class RdxRovingFocusGroupDirective {
    private readonly ngZone = inject(NgZone);
    private readonly elementRef = inject(ElementRef);

    @Input() orientation: Orientation | undefined;
    @Input() dir: Direction = 'ltr';
    @Input({ transform: booleanAttribute }) loop: boolean = false;
    @Input({ transform: booleanAttribute }) preventScrollOnEntryFocus: boolean = false;

    @Output() entryFocus = new EventEmitter<Event>();
    @Output() currentTabStopIdChange = new EventEmitter<string | null>();

    /** @ignore */
    readonly currentTabStopId = signal<string | null>(null);

    /** @ignore */
    readonly focusableItems = signal<HTMLElement[]>([]);

    private readonly isClickFocus = signal(false);
    private readonly isTabbingBackOut = signal(false);
    private readonly focusableItemsCount = signal(0);

    /** @ignore */
    get dataOrientation() {
        return this.orientation || 'horizontal';
    }

    /** @ignore */
    get tabIndex() {
        return this.isTabbingBackOut() || this.getFocusableItemsCount() === 0 ? -1 : 0;
    }

    /** @ignore */
    handleMouseUp() {
        // reset `isClickFocus` after 1 tick because handleFocus might not triggered due to focused element
        this.ngZone.runOutsideAngular(() => {
            // eslint-disable-next-line promise/catch-or-return,promise/always-return
            Promise.resolve().then(() => {
                this.ngZone.run(() => {
                    this.isClickFocus.set(false);
                });
            });
        });
    }

    /** @ignore */
    handleFocus(event: FocusEvent) {
        // We normally wouldn't need this check, because we already check
        // that the focus is on the current target and not bubbling to it.
        // We do this because Safari doesn't focus buttons when clicked, and
        // instead, the wrapper will get focused and not through a bubbling event.
        const isKeyboardFocus = !this.isClickFocus();

        if (
            event.currentTarget === this.elementRef.nativeElement &&
            event.target === event.currentTarget &&
            isKeyboardFocus &&
            !this.isTabbingBackOut()
        ) {
            const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
            this.elementRef.nativeElement.dispatchEvent(entryFocusEvent);
            this.entryFocus.emit(entryFocusEvent);

            if (!entryFocusEvent.defaultPrevented) {
                const items = this.focusableItems().filter((item) => item.dataset['disabled'] !== '');
                const activeItem = items.find((item) => item.getAttribute('data-active') === 'true');
                const currentItem = items.find((item) => item.id === this.currentTabStopId());
                const candidateItems = [activeItem, currentItem, ...items].filter(Boolean) as HTMLElement[];

                focusFirst(candidateItems, this.preventScrollOnEntryFocus);
            }
        }
        this.isClickFocus.set(false);
    }

    /** @ignore */
    handleMouseDown() {
        this.isClickFocus.set(true);
    }

    /** @ignore */
    onItemFocus(tabStopId: string) {
        this.currentTabStopId.set(tabStopId);
        this.currentTabStopIdChange.emit(tabStopId);
    }

    /** @ignore */
    onItemShiftTab() {
        this.isTabbingBackOut.set(true);
    }

    /** @ignore */
    onFocusableItemAdd() {
        this.focusableItemsCount.update((count) => count + 1);
    }

    /** @ignore */
    onFocusableItemRemove() {
        this.focusableItemsCount.update((count) => Math.max(0, count - 1));
    }

    /** @ignore */
    registerItem(item: HTMLElement) {
        const currentItems = this.focusableItems();
        this.focusableItems.set([...currentItems, item]);
    }

    /** @ignore */
    unregisterItem(item: HTMLElement) {
        const currentItems = this.focusableItems();
        this.focusableItems.set(currentItems.filter((el) => el !== item));
    }

    /** @ignore */
    getFocusableItemsCount() {
        return this.focusableItemsCount();
    }
}
