import { injectCalendarRootContext } from './calendar-context.token';
import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { DateValue, getLocalTimeZone, isSameDay, isSameMonth, isToday } from '@internationalized/date';
import * as kbd from '@radix-ng/primitives/core';
import { getDaysInMonth, toDate } from '@radix-ng/primitives/core';

@Directive({
    selector: '[rdxCalendarCellTrigger]',
    exportAs: 'rdxCalendarCellTrigger',
    host: {
        role: 'button',
        '[attr.aria-label]': 'labelText()',
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
export class RdxCalendarCellTriggerDirective {
    private readonly rootContext = injectCalendarRootContext();
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    constructor() {
        // Host element is available in the constructor; no AfterViewInit needed.
        this.currentElement = this.elementRef.nativeElement;
    }

    /**
     * The date value provided to the cell trigger
     */
    readonly day = input<DateValue>();

    /**
     * The month in which the cell is rendered
     */
    readonly month = input<DateValue>();

    /**
     * Current day
     */
    readonly dayValue = computed(() => this.day()?.day.toLocaleString());

    /**
     * Current today state
     */
    readonly isDateToday = computed(() => {
        return isToday(<DateValue>this.day(), getLocalTimeZone());
    });

    /**
     * Current selected state
     */
    readonly isSelectedDate = computed(() => this.rootContext.isDateSelected(<DateValue>this.day()));

    readonly isDisabled = computed(() => this.rootContext.dateDisabled(<DateValue>this.day()));

    readonly isOutsideView = computed(() => {
        return !isSameMonth(<DateValue>this.day(), <DateValue>this.month());
    });

    readonly isFocusedDate = computed(() => {
        return !this.rootContext.disabled() && isSameDay(<DateValue>this.day(), this.rootContext.placeholder());
    });

    readonly isUnavailable = computed(() => this.rootContext.dateUnavailable(<DateValue>this.day()));

    readonly labelText = computed(() => {
        return this.rootContext.formatter.custom(toDate(<DateValue>this.day()), {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    });

    /**
     * @ignore
     */
    currentElement!: HTMLElement;

    protected onClick() {
        this.select();
    }

    /** Select the date unless the cell is disabled/unavailable or the calendar is readonly. */
    private select() {
        if (this.isDisabled() || this.isUnavailable() || this.rootContext.readonly()) {
            return;
        }

        const day = this.day();
        if (day) {
            this.changeDate(day);
        }
    }

    protected onArrowKey(event: Event) {
        const keyEvent = event as KeyboardEvent;
        const code = keyEvent.code;
        if (
            ![kbd.ARROW_RIGHT, kbd.ARROW_LEFT, kbd.ARROW_UP, kbd.ARROW_DOWN, kbd.ENTER, kbd.SPACE_CODE].includes(code)
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const indexIncrementation = 7;
        const sign = this.rootContext.dir() === 'rtl' ? -1 : 1;

        switch (code) {
            case kbd.ARROW_RIGHT:
                this.shiftFocus(this.currentElement, sign);
                break;
            case kbd.ARROW_LEFT:
                this.shiftFocus(this.currentElement, -sign);
                break;
            case kbd.ARROW_UP:
                this.shiftFocus(this.currentElement, -indexIncrementation);
                break;
            case kbd.ARROW_DOWN:
                this.shiftFocus(this.currentElement, indexIncrementation);
                break;
            case kbd.ENTER:
            case kbd.SPACE_CODE:
                this.select();
        }
    }

    private shiftFocus(node: HTMLElement, add: number) {
        const parentElement = this.rootContext.currentElement;

        const allCollectionItems: HTMLElement[] = this.getSelectableCells(parentElement);
        if (!allCollectionItems.length) return;

        const index = allCollectionItems.indexOf(node);
        const newIndex = index + add;

        if (newIndex >= 0 && newIndex < allCollectionItems.length) {
            this.focusCell(allCollectionItems, newIndex, add);
            return;
        }

        if (newIndex < 0) {
            if (!this.rootContext.prevPage) return;

            this.rootContext.prevPage();

            setTimeout(() => {
                const cells = this.getSelectableCells(parentElement);
                if (!cells.length) return;

                const computedIndex =
                    !this.rootContext.pagedNavigation() && this.rootContext.numberOfMonths() > 1
                        ? // placeholder is the first month of the new page
                          getDaysInMonth(this.rootContext.placeholder()) - Math.abs(newIndex)
                        : cells.length - Math.abs(newIndex);

                this.focusCell(cells, computedIndex, add);
            });
            return;
        }

        // newIndex >= allCollectionItems.length
        if (!this.rootContext.nextPage) return;

        this.rootContext.nextPage();

        setTimeout(() => {
            const cells = this.getSelectableCells(parentElement);
            if (!cells.length) return;

            let computedIndex: number;
            if (!this.rootContext.pagedNavigation() && this.rootContext.numberOfMonths() > 1) {
                const numberOfDays = getDaysInMonth(
                    this.rootContext.placeholder().add({ months: this.rootContext.numberOfMonths() - 1 })
                );
                computedIndex = newIndex - allCollectionItems.length + (cells.length - numberOfDays);
            } else {
                computedIndex = newIndex - allCollectionItems.length;
            }

            this.focusCell(cells, computedIndex, add);
        });
    }

    /** Focus the cell at `index`, skipping over a disabled cell in the same direction. */
    private focusCell(cells: HTMLElement[], index: number, add: number) {
        const cell = cells[index];
        if (!cell) return;

        if (cell.hasAttribute('data-disabled')) {
            this.shiftFocus(cell, add);
            return;
        }

        cell.focus();
    }

    /**
     * @ignore
     */
    SELECTOR = '[data-rdx-calendar-cell-trigger]:not([data-outside-view]):not([data-outside-visible-view])';

    /**
     * @ignore
     */
    getSelectableCells(calendar: HTMLElement): HTMLElement[] {
        return Array.from(calendar.querySelectorAll(this.SELECTOR)) ?? [];
    }

    /**
     * @ignore
     */
    changeDate(date: DateValue) {
        this.rootContext.onDateChange(date);
    }
}
