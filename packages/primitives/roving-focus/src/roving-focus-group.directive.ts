import { BooleanInput } from '@angular/cdk/coercion';
import { isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    model,
    output,
    PLATFORM_ID,
    signal
} from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';
import { Direction, ENTRY_FOCUS, EVENT_OPTIONS, focusFirst, Orientation } from './utils';

const rootContext = () => {
    const rovingFocusGroup = inject(RdxRovingFocusGroupDirective);
    return {
        loop: rovingFocusGroup.loop,
        dir: rovingFocusGroup.dir,
        orientation: rovingFocusGroup.orientation,
        currentTabStopId: rovingFocusGroup.currentTabStopId,
        focusableItems: rovingFocusGroup.focusableItems,
        onItemFocus: (tabStopId: string) => {
            rovingFocusGroup.currentTabStopId.set(tabStopId);
        },
        onItemShiftTab: () => {
            rovingFocusGroup.isTabbingBackOut.set(true);
        },
        onFocusableItemAdd: () => {
            rovingFocusGroup.focusableItemsCount.update((count) => count + 1);
        },
        onFocusableItemRemove: () => {
            rovingFocusGroup.focusableItemsCount.update((count) => Math.max(0, count - 1));
        },
        registerItem: (item: HTMLElement) => {
            const currentItems = rovingFocusGroup.focusableItems();
            rovingFocusGroup.focusableItems.set([...currentItems, item]);
        },
        unregisterItem: (item: HTMLElement) => {
            const currentItems = rovingFocusGroup.focusableItems();
            rovingFocusGroup.focusableItems.set(currentItems.filter((el) => el !== item));
        }
    };
};

export type RovingFocusGroupContext = ReturnType<typeof rootContext>;

export const [injectRovingFocusGroupContext, provideRovingFocusGroupContext] =
    createContext<RovingFocusGroupContext>('RovingFocusGroupContext');

/**
 * @group Components
 */
@Directive({
    selector: '[rdxRovingFocusGroup]',
    providers: [provideRovingFocusGroupContext(rootContext)],
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.tabindex]': 'isTabbingBackOut() || focusableItemsCount() === 0 ? -1 : 0',
        '[attr.dir]': 'dir()',
        '(focus)': 'handleFocus($event)',
        '(blur)': 'isTabbingBackOut.set(false)',
        '(mouseup)': 'handleMouseUp()',
        '(mousedown)': 'isClickFocus.set(true)',
        style: 'outline: none;'
    }
})
export class RdxRovingFocusGroupDirective {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly elementRef = inject(ElementRef);

    /**
     * The orientation of the group. Mainly so arrow navigation is done accordingly (left & right vs. up & down)
     */
    readonly orientationInput = input<Orientation>('horizontal', { alias: 'orientation' });

    /**
     * The direction of navigation between items.
     */
    readonly dirInput = input<Direction>('ltr', { alias: 'dir' });

    /**
     * Whether keyboard navigation should loop around
     */
    readonly loopInput = input<boolean, BooleanInput>(true, { transform: booleanAttribute, alias: 'loop' });

    /**
     * When `true`, will prevent scrolling to the focus item when focused.
     * @group Props
     */
    readonly preventScrollOnEntryFocus = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The value of the current stop item.
     *
     * Use when you do not need to control the state of the stop item.
     * @group Props
     */
    readonly defaultCurrentTabStopId = input<string | undefined>(undefined);

    /**
     * The controlled value of the current stop item. Can be binded as `model`.
     * @group Props
     */
    readonly currentTabStopId = model<string | undefined>(undefined);

    /**
     * Event handler called when container is being focused. Can be prevented.
     * @group Emits
     */
    readonly entryFocus = output<Event>();

    private readonly _orientation = linkedSignal(() => this.orientationInput());
    readonly orientation = this._orientation.asReadonly();

    private readonly _dir = linkedSignal(() => this.dirInput());
    readonly dir = this._dir.asReadonly();

    private readonly _loop = linkedSignal(() => this.loopInput());
    readonly loop = this._loop.asReadonly();

    readonly focusableItems = signal<HTMLElement[]>([]);
    protected readonly isClickFocus = signal(false);
    readonly isTabbingBackOut = signal(false);
    readonly focusableItemsCount = signal(0);

    constructor() {
        effect(() => {
            if (this.currentTabStopId() === undefined) {
                const def = this.defaultCurrentTabStopId();
                if (def !== undefined) {
                    this.currentTabStopId.set(def);
                }
            }
        });
    }

    setOrientation(value: Orientation) {
        this._orientation.set(value);
    }

    setDir(value: Direction) {
        this._dir.set(value);
    }

    setLoop(value: boolean) {
        this._loop.set(value);
    }

    /** @ignore */
    handleMouseUp() {
        if (!this.isBrowser) return;

        // reset `isClickFocus` after 1 tick because handleFocus might not triggered due to focused element
        requestAnimationFrame(() => {
            this.isClickFocus.set(false);
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
                const highlightedItem = items.find((item) => item.getAttribute('data-highlighted') === '');
                const currentItem = items.find((item) => item.id === this.currentTabStopId());

                const candidateItems = [activeItem, highlightedItem, currentItem, ...items].filter(
                    Boolean
                ) as typeof items;

                focusFirst(candidateItems, this.preventScrollOnEntryFocus());
            }
        }

        this.isClickFocus.set(false);
    }
}
