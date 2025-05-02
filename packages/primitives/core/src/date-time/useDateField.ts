import { computed, InputSignal, ModelSignal, WritableSignal } from '@angular/core';
import { CalendarDateTime, CycleTimeOptions, DateFields, DateValue, TimeFields } from '@internationalized/date';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, BACKSPACE, SHIFT, TAB } from '../kbd-constants';
import { getDaysInMonth, toDate } from './comparators';
import { Formatter } from './formatter';
import { isAcceptableSegmentKey, isNumberString, isSegmentNavigationKey } from './segment';
import { AnyExceptLiteral, DateAndTimeSegmentObj, HourCycle, SegmentPart, SegmentValueObj } from './types';

type MinuteSecondIncrementProps = {
    e: KeyboardEvent;
    part: keyof TimeFields;
    dateRef: DateValue;
    prevValue: number | null;
};

type DateTimeValueIncrementation = {
    e: KeyboardEvent;
    part: keyof Omit<DateFields, 'era'> | keyof TimeFields;
    dateRef: DateValue;
    prevValue: number | null;
    hourCycle?: HourCycle;
};

export type UseDateFieldProps = {
    hasLeftFocus: WritableSignal<boolean>;
    lastKeyZero: WritableSignal<boolean>;
    placeholder: ModelSignal<DateValue>;
    hourCycle: HourCycle;
    formatter: Formatter;
    segmentValues: WritableSignal<SegmentValueObj>;
    disabled: InputSignal<boolean>;
    readonly: InputSignal<boolean>;
    part: SegmentPart;
    modelValue: ModelSignal<DateValue | undefined>;
    focusNext: () => void;
};

type SegmentAttrProps = {
    disabled: boolean;
    segmentValues: SegmentValueObj;
    hourCycle: HourCycle;
    placeholder: DateValue;
    formatter: Formatter;
};

function commonSegmentAttrs(props: SegmentAttrProps) {
    return {
        role: 'spinbutton',
        contenteditable: true,
        tabindex: props.disabled ? undefined : 0,
        spellcheck: false,
        inputmode: 'numeric',
        autocorrect: 'off',
        enterkeyhint: 'next',
        style: 'caret-color: transparent;'
    };
}

function daySegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues, placeholder } = props;
    const isEmpty = segmentValues.day === null;
    const date = segmentValues.day ? placeholder.set({ day: segmentValues.day }) : placeholder;

    const valueNow = date.day;
    const valueMin = 1;
    const valueMax = getDaysInMonth(date);
    const valueText = isEmpty ? 'Empty' : `${valueNow}`;

    return {
        ...commonSegmentAttrs(props),
        'aria-label': 'day,',
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText,
        'data-placeholder': isEmpty ? '' : undefined
    };
}

function monthSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues, placeholder, formatter } = props;
    const isEmpty = segmentValues.month === null;
    const date = segmentValues.month ? placeholder.set({ month: segmentValues.month }) : placeholder;
    const valueNow = date.month;
    const valueMin = 1;
    const valueMax = 12;
    const valueText = isEmpty ? 'Empty' : `${valueNow} - ${formatter.fullMonth(toDate(date))}`;

    return {
        ...commonSegmentAttrs(props),
        'aria-label': 'month, ',
        contenteditable: true,
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText,
        'data-placeholder': isEmpty ? '' : undefined
    };
}

function yearSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues, placeholder } = props;
    const isEmpty = segmentValues.year === null;
    const date = segmentValues.year ? placeholder.set({ year: segmentValues.year }) : placeholder;
    const valueMin = 1;
    const valueMax = 9999;
    const valueNow = date.year;
    const valueText = isEmpty ? 'Empty' : `${valueNow}`;

    return {
        ...commonSegmentAttrs(props),
        'aria-label': 'year, ',
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText,
        'data-placeholder': isEmpty ? '' : undefined
    };
}

function hourSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues, hourCycle, placeholder } = props;

    if (!('hour' in segmentValues) || !('hour' in placeholder)) return {};
    const isEmpty = segmentValues.hour === null;
    const date = segmentValues.hour ? placeholder.set({ hour: segmentValues.hour }) : placeholder;
    const valueMin = hourCycle === 12 ? 1 : 0;
    const valueMax = hourCycle === 12 ? 12 : 23;
    const valueNow = date.hour;
    const valueText = isEmpty ? 'Empty' : `${valueNow} ${segmentValues.dayPeriod ?? ''}`;

    return {
        ...commonSegmentAttrs(props),
        'aria-label': 'hour, ',
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText,
        'data-placeholder': isEmpty ? '' : undefined
    };
}

function minuteSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues, placeholder } = props;
    if (!('minute' in segmentValues) || !('minute' in placeholder)) return {};
    const isEmpty = segmentValues.minute === null;
    const date = segmentValues.minute ? placeholder.set({ minute: segmentValues.minute }) : placeholder;
    const valueNow = date.minute;
    const valueMin = 0;
    const valueMax = 59;
    const valueText = isEmpty ? 'Empty' : `${valueNow}`;

    return {
        ...commonSegmentAttrs(props),
        'aria-label': 'minute, ',
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText,
        'data-placeholder': isEmpty ? '' : undefined
    };
}

function secondSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues, placeholder } = props;
    if (!('second' in segmentValues) || !('second' in placeholder)) return {};
    const isEmpty = segmentValues.second === null;
    const date = segmentValues.second ? placeholder.set({ second: segmentValues.second }) : placeholder;
    const valueNow = date.second;
    const valueMin = 0;
    const valueMax = 59;
    const valueText = isEmpty ? 'Empty' : `${valueNow}`;

    return {
        ...commonSegmentAttrs(props),
        'aria-label': 'second, ',
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText,
        'data-placeholder': isEmpty ? '' : undefined
    };
}

function dayPeriodSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues } = props;
    if (!('dayPeriod' in segmentValues)) return {};

    const valueMin = 0;
    const valueMax = 12;
    const valueNow = segmentValues.hour ? (segmentValues.hour > 12 ? segmentValues.hour - 12 : segmentValues.hour) : 0;
    const valueText = segmentValues.dayPeriod ?? 'AM';

    return {
        ...commonSegmentAttrs(props),
        inputmode: 'text',
        'aria-label': 'AM/PM',
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText
    };
}

function literalSegmentAttrs(_props: SegmentAttrProps) {
    return {
        'aria-hidden': true,
        'data-segment': 'literal'
    };
}

function timeZoneSegmentAttrs(props: SegmentAttrProps) {
    return {
        role: 'textbox',
        'aria-label': 'timezone, ',
        'data-readonly': true,
        'data-segment': 'timeZoneName',
        tabindex: props.disabled ? undefined : 0,
        style: 'caret-color: transparent;'
    };
}

function eraSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues, placeholder } = props;

    const valueMin = 0;
    const valueMax = 0;
    const valueNow = 0;
    const valueText = 'era' in segmentValues ? segmentValues.era : placeholder.era;

    return {
        ...commonSegmentAttrs(props),
        'aria-label': 'era',
        'aria-valuemin': valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText
    };
}

export const segmentBuilders = {
    day: {
        attrs: daySegmentAttrs
    },
    month: {
        attrs: monthSegmentAttrs
    },
    year: {
        attrs: yearSegmentAttrs
    },
    hour: {
        attrs: hourSegmentAttrs
    },
    minute: {
        attrs: minuteSegmentAttrs
    },
    second: {
        attrs: secondSegmentAttrs
    },
    dayPeriod: {
        attrs: dayPeriodSegmentAttrs
    },
    literal: {
        attrs: literalSegmentAttrs
    },
    timeZoneName: {
        attrs: timeZoneSegmentAttrs
    },
    era: {
        attrs: eraSegmentAttrs
    }
};

export function useDateField(props: UseDateFieldProps) {
    function handleSegmentClick(e: MouseEvent) {
        const disabled = props.disabled();
        if (disabled) e.preventDefault();
    }

    function deleteValue(prevValue: number | null) {
        props.hasLeftFocus.set(false);

        if (prevValue === null) return prevValue;

        const str = prevValue.toString();
        if (str.length === 1) {
            props.modelValue.set(undefined);
            return null;
        }

        return Number.parseInt(str.slice(0, -1));
    }

    function dateTimeValueIncrementation({
        e,
        part,
        dateRef,
        prevValue,
        hourCycle
    }: DateTimeValueIncrementation): number {
        const sign = e.key === ARROW_UP ? 1 : -1;

        if (prevValue === null) return dateRef[part as keyof Omit<DateFields, 'era'>];

        if (part === 'hour' && 'hour' in dateRef) {
            const cycleArgs: [keyof DateFields | keyof TimeFields, number, CycleTimeOptions?] = [
                part,
                sign,
                { hourCycle }];
            return dateRef.set({ [part as keyof DateValue]: prevValue }).cycle(...cycleArgs)[part];
        }

        const cycleArgs: [keyof DateFields, number] = [part as keyof DateFields, sign];
        if (part === 'day' && props.segmentValues().month !== null)
            return dateRef
                .set({ [part as keyof DateValue]: prevValue, month: props.segmentValues().month! })
                .cycle(...cycleArgs)[part as keyof Omit<DateFields, 'era'>];

        return dateRef.set({ [part as keyof DateValue]: prevValue }).cycle(...cycleArgs)[
            part as keyof Omit<DateFields, 'era'>
        ];
    }

    function updateDayOrMonth(max: number, num: number, prev: number | null) {
        let moveToNext = false;
        const maxStart = Math.floor(max / 10);

        /**
         * If the user has left the segment, we want to reset the
         * `prev` value so that we can start the segment over again
         * when the user types a number.
         */
        if (props.hasLeftFocus()) {
            props.hasLeftFocus.set(false);
            prev = null;
        }

        if (prev === null) {
            /**
             * If the user types a 0 as the first number, we want
             * to keep track of that so that when they type the next
             * number, we can move to the next segment.
             */

            if (num === 0) {
                props.lastKeyZero.set(true);
                return { value: null, moveToNext };
            }
            /**
             * If the last key was a 0, or if the first number is
             * greater than the max start digit (0-3 in most cases), then
             * we want to move to the next segment, since it's not possible
             * to continue typing a valid number in this segment.
             */

            if (props.lastKeyZero() || num > maxStart) {
                // move to next
                moveToNext = true;
            }
            props.lastKeyZero.set(false);
            /**
             * If none of the above conditions are met, then we can just
             * return the number as the segment value and continue typing
             * in this segment.
             */
            return { value: num, moveToNext };
        }

        /**
         * If the number of digits is 2, or if the total with the existing digit
         * and the pressed digit is greater than the maximum value for this
         * month, then we will reset the segment as if the user had pressed the
         * backspace key and then typed the number.
         */
        const digits = prev.toString().length;
        const total = Number.parseInt(prev.toString() + num.toString());
        /**
         * If the number of digits is 2, or if the total with the existing digit
         * and the pressed digit is greater than the maximum value for this
         * month, then we will reset the segment as if the user had pressed the
         * backspace key and then typed the number.
         */

        if (digits === 2 || total > max) {
            /**
             * As we're doing elsewhere, we're checking if the number is greater
             * than the max start digit (0-3 in most months), and if so, we're
             * going to move to the next segment.
             */
            if (num > maxStart || total > max) {
                // move to next
                moveToNext = true;
            }
            return { value: num, moveToNext };
        }
        // move to next
        moveToNext = true;
        return { value: total, moveToNext };
    }

    function updateYear(num: number, prev: number | null) {
        let moveToNext = false;

        /**
         * If the user has left the segment, we want to reset the
         * `prev` value so that we can start the segment over again
         * when the user types a number.
         */
        // probably not implement, kind of weird
        if (props.hasLeftFocus()) {
            props.hasLeftFocus.set(false);
            prev = null;
        }

        if (prev === null) return { value: num === 0 ? 1 : num, moveToNext };

        const str = prev.toString() + num.toString();

        if (str.length > 4) return { value: num === 0 ? 1 : num, moveToNext };

        if (str.length === 4) moveToNext = true;

        const int = Number.parseInt(str);
        return { value: int, moveToNext };
    }

    function updateHour(num: number, prev: number | null) {
        const max = 24;
        let moveToNext = false;
        const maxStart = Math.floor(max / 10);

        /**
         * If the user has left the segment, we want to reset the
         * `prev` value so that we can start the segment over again
         * when the user types a number.
         */
        // probably not implement, kind of weird
        if (props.hasLeftFocus()) {
            props.hasLeftFocus.set(false);
            prev = null;
        }

        if (prev === null) {
            /**
             * If the user types a 0 as the first number, we want
             * to keep track of that so that when they type the next
             * number, we can move to the next segment.
             */

            if (num === 0) {
                props.lastKeyZero.set(true);
                return { value: 0, moveToNext };
            }
            /**
             * If the last key was a 0, or if the first number is
             * greater than the max start digit (0-3 in most cases), then
             * we want to move to the next segment, since it's not possible
             * to continue typing a valid number in this segment.
             */

            if (props.lastKeyZero() || num > maxStart) {
                // move to next
                moveToNext = true;
            }
            props.lastKeyZero.set(false);
            /**
             * If none of the above conditions are met, then we can just
             * return the number as the segment value and continue typing
             * in this segment.
             */
            return { value: num, moveToNext };
        }

        /**
         * If the number of digits is 2, or if the total with the existing digit
         * and the pressed digit is greater than the maximum value for this
         * month, then we will reset the segment as if the user had pressed the
         * backspace key and then typed the number.
         */
        const digits = prev.toString().length;
        const total = Number.parseInt(prev.toString() + num.toString());

        /**
         * If the number of digits is 2, or if the total with the existing digit
         * and the pressed digit is greater than the maximum value for this
         * month, then we will reset the segment as if the user had pressed the
         * backspace key and then typed the number.
         */

        if (digits === 2 || total > max) {
            /**
             * As we're doing elsewhere, we're checking if the number is greater
             * than the max start digit (0-3 in most months), and if so, we're
             * going to move to the next segment.
             */
            if (num > maxStart) {
                // move to next
                moveToNext = true;
            }
            return { value: num, moveToNext };
        }
        // move to next
        moveToNext = true;
        return { value: total, moveToNext };
    }

    function updateMinuteOrSecond(num: number, prev: number | null) {
        const max = 59;
        let moveToNext = false;
        const maxStart = Math.floor(max / 10);

        /**
         * If the user has left the segment, we want to reset the
         * `prev` value so that we can start the segment over again
         * when the user types a number.
         */
        if (props.hasLeftFocus()) {
            props.hasLeftFocus.set(false);
            prev = null;
        }

        if (prev === null) {
            /**
             * If the user types a 0 as the first number, we want
             * to keep track of that so that when they type the next
             * number, we can move to the next segment.
             */

            if (num === 0) {
                props.lastKeyZero.set(true);
                return { value: 0, moveToNext };
            }
            /**
             * If the last key was a 0, or if the first number is
             * greater than the max start digit (0-3 in most cases), then
             * we want to move to the next segment, since it's not possible
             * to continue typing a valid number in this segment.
             */

            if (props.lastKeyZero() || num > maxStart) {
                // move to next
                moveToNext = true;
            }
            props.lastKeyZero.set(false);
            /**
             * If none of the above conditions are met, then we can just
             * return the number as the segment value and continue typing
             * in this segment.
             */
            return { value: num, moveToNext };
        }

        /**
         * If the number of digits is 2, or if the total with the existing digit
         * and the pressed digit is greater than the maximum value for this
         * month, then we will reset the segment as if the user had pressed the
         * backspace key and then typed the number.
         */
        const digits = prev.toString().length;
        const total = Number.parseInt(prev.toString() + num.toString());

        /**
         * If the number of digits is 2, or if the total with the existing digit
         * and the pressed digit is greater than the maximum value for this
         * month, then we will reset the segment as if the user had pressed the
         * backspace key and then typed the number.
         */

        if (digits === 2 || total > max) {
            /**
             * As we're doing elsewhere, we're checking if the number is greater
             * than the max start digit (0-3 in most months), and if so, we're
             * going to move to the next segment.
             */
            if (num > maxStart) {
                // move to next
                moveToNext = true;
            }
            return { value: num, moveToNext };
        }
        // move to next
        moveToNext = true;
        return { value: total, moveToNext };
    }

    function minuteSecondIncrementation({ e, part, dateRef, prevValue }: MinuteSecondIncrementProps): number {
        const sign = e.key === ARROW_UP ? 1 : -1;
        const min = 0;
        const max = 59;

        if (prevValue === null) return sign > 0 ? min : max;

        const cycleArgs: [keyof TimeFields, number] = [part, sign];
        return (dateRef as CalendarDateTime).set({ [part]: prevValue }).cycle(...cycleArgs)[part];
    }

    const attributes = computed(
        () =>
            segmentBuilders[props.part]?.attrs({
                disabled: props.disabled(),
                placeholder: props.placeholder(),
                hourCycle: props.hourCycle,
                segmentValues: props.segmentValues(),
                formatter: props.formatter
            }) ?? {}
    );

    function handleMonthSegmentKeydown(e: KeyboardEvent) {
        if (!isAcceptableSegmentKey(e.key) || isSegmentNavigationKey(e.key)) return;

        const prevValue = props.segmentValues().month;

        if (e.key === ARROW_DOWN || e.key === ARROW_UP) {
            props.segmentValues.update((prev) => ({
                ...prev,
                month: dateTimeValueIncrementation({
                    e,
                    part: 'month',
                    dateRef: props.placeholder(),
                    prevValue
                })
            }));
            return;
        }

        if (isNumberString(e.key)) {
            const num = Number.parseInt(e.key);
            const { value, moveToNext } = updateDayOrMonth(12, num, prevValue);

            props.segmentValues.update((prev) => ({ ...prev, month: value }));

            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, month: deleteValue(prevValue) }));
        }
    }

    function handleDaySegmentKeydown(e: KeyboardEvent) {
        if (!isAcceptableSegmentKey(e.key) || isSegmentNavigationKey(e.key)) return;

        const prevValue = props.segmentValues().day;

        if (e.key === ARROW_DOWN || e.key === ARROW_UP) {
            props.segmentValues.update((prev) => ({
                ...prev,
                day: dateTimeValueIncrementation({
                    e,
                    part: 'day',
                    dateRef: props.placeholder(),
                    prevValue
                })
            }));
            return;
        }

        if (isNumberString(e.key)) {
            const num = Number.parseInt(e.key);
            const segmentMonthValue = props.segmentValues().month;

            const daysInMonth = segmentMonthValue
                ? getDaysInMonth(props.placeholder().set({ month: segmentMonthValue }))
                : getDaysInMonth(props.placeholder());

            const { value, moveToNext } = updateDayOrMonth(daysInMonth, num, prevValue);

            props.segmentValues.update((prev) => ({ ...prev, day: value }));

            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, day: deleteValue(prevValue) }));
        }
    }

    function handleYearSegmentKeydown(e: KeyboardEvent) {
        if (!isAcceptableSegmentKey(e.key) || isSegmentNavigationKey(e.key)) return;

        const prevValue = props.segmentValues().year;

        if (e.key === ARROW_DOWN || e.key === ARROW_UP) {
            props.segmentValues.update((prev) => ({
                ...prev,
                year: dateTimeValueIncrementation({
                    e,
                    part: 'year',
                    dateRef: props.placeholder(),
                    prevValue
                })
            }));
            return;
        }

        if (isNumberString(e.key)) {
            const num = Number.parseInt(e.key);
            const { value, moveToNext } = updateYear(num, prevValue);

            props.segmentValues.update((prev) => ({ ...prev, year: value }));

            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, year: deleteValue(prevValue) }));
        }
    }

    function handleHourSegmentKeydown(e: KeyboardEvent) {
        const dateRef = props.placeholder();
        const values = props.segmentValues() as DateAndTimeSegmentObj;

        if (
            !isAcceptableSegmentKey(e.key) ||
            isSegmentNavigationKey(e.key) ||
            !('hour' in dateRef) ||
            !('hour' in values)
        )
            return;

        const prevValue = values.hour;

        const hourCycle = props.hourCycle;

        if (e.key === ARROW_UP || e.key === ARROW_DOWN) {
            props.segmentValues.update((prev) => ({
                ...prev,
                hour: dateTimeValueIncrementation({
                    e,
                    part: 'hour',
                    dateRef: props.placeholder(),
                    prevValue,
                    hourCycle
                })
            }));

            if ('dayPeriod' in props.segmentValues() && values.hour != null) {
                if (values.hour < 12) props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'AM' }));
                else if (values.hour) props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'PM' }));
            }

            return;
        }

        if (isNumberString(e.key)) {
            const num = Number.parseInt(e.key);
            const { value, moveToNext } = updateHour(num, prevValue);

            if ('dayPeriod' in props.segmentValues() && value && value > 12)
                props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'AM' }));
            else if ('dayPeriod' in props.segmentValues() && value)
                props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'PM' }));

            props.segmentValues.update((prev) => ({ ...prev, hour: value }));

            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, hour: deleteValue(prevValue) }));
        }
    }

    function handleMinuteSegmentKeydown(e: KeyboardEvent) {
        const dateRef = props.placeholder();

        const values = props.segmentValues() as DateAndTimeSegmentObj;

        if (
            !isAcceptableSegmentKey(e.key) ||
            isSegmentNavigationKey(e.key) ||
            !('minute' in dateRef) ||
            !('minute' in values)
        )
            return;

        const prevValue = values.minute;

        props.segmentValues.update((prev) => ({
            ...prev,
            minute: minuteSecondIncrementation({
                e,
                part: 'minute',
                dateRef: props.placeholder(),
                prevValue
            })
        }));

        if (isNumberString(e.key)) {
            const num = Number.parseInt(e.key);

            const { value, moveToNext } = updateMinuteOrSecond(num, prevValue);

            props.segmentValues.update((prev) => ({ ...prev, minute: value }));

            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, minute: deleteValue(prevValue) }));
        }
    }

    function handleSecondSegmentKeydown(e: KeyboardEvent) {
        const dateRef = props.placeholder();

        const values = props.segmentValues() as DateAndTimeSegmentObj;

        if (
            !isAcceptableSegmentKey(e.key) ||
            isSegmentNavigationKey(e.key) ||
            !('second' in dateRef) ||
            !('second' in values)
        )
            return;

        const prevValue = values.second;

        props.segmentValues.update((prev) => ({
            ...prev,
            second: minuteSecondIncrementation({
                e,
                part: 'second',
                dateRef: props.placeholder(),
                prevValue
            })
        }));

        if (isNumberString(e.key)) {
            const num = Number.parseInt(e.key);
            const { value, moveToNext } = updateMinuteOrSecond(num, prevValue);

            props.segmentValues.update((prev) => ({ ...prev, second: value }));

            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, second: deleteValue(prevValue) }));
        }
    }

    function handleDayPeriodSegmentKeydown(e: KeyboardEvent) {
        if (
            ((!isAcceptableSegmentKey(e.key) || isSegmentNavigationKey(e.key)) && e.key !== 'a' && e.key !== 'p') ||
            !('hour' in props.placeholder()) ||
            !('dayPeriod' in props.segmentValues())
        )
            return;

        const values = props.segmentValues() as DateAndTimeSegmentObj;

        if (e.key === ARROW_UP || e.key === ARROW_DOWN) {
            if (values.dayPeriod === 'AM') {
                props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'PM' }));
                props.segmentValues.update((prev) => ({ ...prev, hour: values.hour! + 12 }));
                return;
            }
            props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'AM' }));
            props.segmentValues.update((prev) => ({ ...prev, hour: values.hour! - 12 }));
            return;
        }

        if (['a', 'A'].includes(e.key) && values.dayPeriod !== 'AM') {
            props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'AM' }));
            props.segmentValues.update((prev) => ({ ...prev, hour: values.hour! - 12 }));
            return;
        }

        if (['p', 'P'].includes(e.key) && values.dayPeriod !== 'PM') {
            props.segmentValues.update((prev) => ({ ...prev, dayPeriod: 'PM' }));
            props.segmentValues.update((prev) => ({ ...prev, hour: values.hour! + 12 }));
        }
    }

    function handleSegmentKeydown(e: KeyboardEvent) {
        const disabled = props.disabled();
        const readonly = props.readonly();

        if (e.key !== TAB) e.preventDefault();

        if (disabled || readonly) return;

        const segmentKeydownHandlers = {
            month: handleMonthSegmentKeydown,
            day: handleDaySegmentKeydown,
            year: handleYearSegmentKeydown,
            hour: handleHourSegmentKeydown,
            minute: handleMinuteSegmentKeydown,
            second: handleSecondSegmentKeydown,
            dayPeriod: handleDayPeriodSegmentKeydown,
            timeZoneName: () => {}
        } as const;

        segmentKeydownHandlers[props.part as keyof typeof segmentKeydownHandlers](e);

        if (
            ![ARROW_LEFT, ARROW_RIGHT].includes(e.key) &&
            e.key !== TAB &&
            e.key !== SHIFT &&
            isAcceptableSegmentKey(e.key)
        ) {
            if (Object.values(props.segmentValues()).every((item) => item !== null)) {
                const updateObject = { ...(props.segmentValues() as Record<AnyExceptLiteral, number>) };

                let dateRef = props.placeholder().copy();

                Object.keys(updateObject).forEach((part) => {
                    const value = updateObject[part as AnyExceptLiteral];
                    dateRef = dateRef.set({ [part]: value });
                });

                props.modelValue.set(dateRef.copy());
            }
        }
    }

    return {
        handleSegmentClick,
        handleSegmentKeydown,
        attributes
    };
}
