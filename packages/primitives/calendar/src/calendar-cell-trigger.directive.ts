import { AfterViewInit, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { DateValue, getLocalTimeZone, isSameDay, isSameMonth, isToday } from '@internationalized/date';
import * as kbd from '@radix-ng/primitives/core';
import { getDaysInMonth } from '@radix-ng/primitives/core';
import { PrimitiveElementController, usePrimitiveElement } from './usePrimitiveElement';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: '[rdxCalendarCellTrigger]',
    exportAs: 'rdxCalendarCellTrigger',
    host: {
        role: 'button',
        '[attr.aria-disabled]': 'isDisabled() || isUnavailable() ? true : undefined',
        '[attr.data-rdx-calendar-cell-trigger]': '""',
        '[attr.tabindex]': 'isFocusedDate() ? 0 : isOutsideView() || isDisabled() ? undefined : -1',
        '[attr.data-value]': 'day()?.toString()',
        '[attr.data-disabled]': 'isDisabled() ? "" : undefined',
        '[attr.data-today]': 'isDateToday() ? "" : undefined',
        '[attr.data-outside-view]': 'isOutsideView() ? "" : undefined',
        '[attr.data-selected]': 'isSelectedDate() ? "" : undefined',
        '[attr.data-unavailable]': 'isUnavailable() ? "" : undefined',
        '[attr.data-focus]': 'isFocusedDate() ? "" : undefined',

        '(click)': 'onClick()',

        '(keydown)': 'onArrowKey($event)'
    }
})
export class RdxCalendarCellTriggerDirective implements AfterViewInit {
    private readonly rootContext = injectCalendarRootContext();
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    private primitiveElement!: PrimitiveElementController['primitiveElement'];

    readonly day = input<DateValue>();

    readonly month = input<DateValue>();

    readonly dayValue = computed(() => this.day()?.day.toLocaleString());

    readonly isDateToday = computed(() => {
        return isToday(<DateValue>this.day(), getLocalTimeZone());
    });

    readonly isSelectedDate = computed(() => this.rootContext.isDateSelected!(<DateValue>this.day()));

    readonly isDisabled = computed(() => this.rootContext.isDateDisabled!(<DateValue>this.day()));

    readonly isOutsideView = computed(() => {
        return !isSameMonth(<DateValue>this.day(), <DateValue>this.month());
    });

    readonly isFocusedDate = computed(() => {
        return !this.rootContext.disabled() && isSameDay(<DateValue>this.day(), this.rootContext.placeholder());
    });

    readonly isUnavailable = computed(() => this.rootContext.isDateUnavailable?.(<DateValue>this.day()) ?? false);

    currentElement!: PrimitiveElementController['currentElement'];

    constructor() {
        const { primitiveElement, currentElement } = usePrimitiveElement();

        this.currentElement = currentElement;
        this.primitiveElement = primitiveElement;
    }

    ngAfterViewInit() {
        this.primitiveElement.set(this.elementRef.nativeElement);
    }

    protected onClick() {
        this.changeDate(this.day()!);
    }

    protected onArrowKey(event: KeyboardEvent) {
        const code = event.code;
        if (![
                kbd.ARROW_RIGHT,
                kbd.ARROW_LEFT,
                kbd.ARROW_UP,
                kbd.ARROW_DOWN,
                kbd.ENTER,
                kbd.SPACE
            ].includes(code)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const indexIncrementation = 7;
        const sign = this.rootContext.dir() === 'rtl' ? -1 : 1;

        switch (code) {
            case kbd.ARROW_RIGHT:
                this.shiftFocus(this.currentElement()!, sign);
                break;
            case kbd.ARROW_LEFT:
                this.shiftFocus(this.currentElement()!, -sign);
                break;
            case kbd.ARROW_UP:
                this.shiftFocus(this.currentElement()!, -indexIncrementation);
                break;
            case kbd.ARROW_DOWN:
                this.shiftFocus(this.currentElement()!, indexIncrementation);
                break;
            case kbd.ENTER:
            case kbd.SPACE_CODE:
                this.changeDate(<DateValue>this.day());
        }
    }

    private shiftFocus(node: HTMLElement, add: number) {
        const parentElement = this.rootContext.currentElement()!;

        const allCollectionItems: HTMLElement[] = this.getSelectableCells(parentElement);
        if (!allCollectionItems.length) return;

        const index = allCollectionItems.indexOf(node);
        const newIndex = index + add;

        if (newIndex >= 0 && newIndex < allCollectionItems.length) {
            if (allCollectionItems[newIndex].hasAttribute('data-disabled')) {
                this.shiftFocus(allCollectionItems[newIndex], add);
            }
            allCollectionItems[newIndex].focus();
            return;
        }

        if (newIndex < 0) {
            if (!this.rootContext.prevPage) return;

            this.rootContext.prevPage();

            setTimeout(() => {
                const newCollectionItems = this.getSelectableCells(parentElement);
                if (!newCollectionItems.length) return;

                if (!this.rootContext.pagedNavigation && this.rootContext.numberOfMonths() > 1) {
                    // Placeholder is set to the first month of the new page
                    const numberOfDays = getDaysInMonth(this.rootContext.placeholder());
                    const computedIndex = numberOfDays - Math.abs(newIndex);
                    if (newCollectionItems[computedIndex].hasAttribute('data-disabled')) {
                        this.shiftFocus(newCollectionItems[computedIndex], add);
                    }
                    newCollectionItems[computedIndex].focus();
                    return;
                }

                const computedIndex = newCollectionItems.length - Math.abs(newIndex);
                if (newCollectionItems[computedIndex].hasAttribute('data-disabled')) {
                    this.shiftFocus(newCollectionItems[computedIndex], add);
                }
                newCollectionItems[computedIndex].focus();
            });
        }

        if (newIndex >= allCollectionItems.length) {
            if (!this.rootContext.nextPage) return;

            this.rootContext.nextPage();

            setTimeout(() => {
                const newCollectionItems = this.getSelectableCells(parentElement);
                if (!newCollectionItems.length) return;

                if (!this.rootContext.pagedNavigation && this.rootContext.numberOfMonths() > 1) {
                    const numberOfDays = getDaysInMonth(
                        this.rootContext.placeholder().add({ months: this.rootContext.numberOfMonths() - 1 })
                    );

                    const computedIndex =
                        newIndex - allCollectionItems.length + (newCollectionItems.length - numberOfDays);

                    if (newCollectionItems[computedIndex].hasAttribute('data-disabled')) {
                        this.shiftFocus(newCollectionItems[computedIndex], add);
                    }
                    newCollectionItems[computedIndex].focus();
                    return;
                }

                const computedIndex = newIndex - allCollectionItems.length;
                if (newCollectionItems[computedIndex].hasAttribute('data-disabled')) {
                    this.shiftFocus(newCollectionItems[computedIndex], add);
                }

                newCollectionItems[computedIndex].focus();
            });
        }
    }

    SELECTOR = '[data-rdx-calendar-cell-trigger]:not([data-outside-view]):not([data-outside-visible-view])';
    getSelectableCells(calendar: HTMLElement): HTMLElement[] {
        return Array.from(calendar.querySelectorAll(this.SELECTOR)) ?? [];
    }

    changeDate(date: DateValue) {
        this.rootContext.onDateChange(date);
    }
}
