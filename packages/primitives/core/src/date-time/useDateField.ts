// https://github.com/unovue/reka-ui/blob/v2/packages/core/src/shared/date/useDateField.ts

import { computed, InputSignal, ModelSignal, Signal, WritableSignal } from '@angular/core';
import { CalendarDateTime, CycleTimeOptions, DateFields, DateValue, TimeFields } from '@internationalized/date';
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, BACKSPACE, SHIFT, TAB } from '../kbd-constants';
import { getDaysInMonth, toDate } from './comparators';
import { Formatter } from './formatter';
import { isAcceptableSegmentKey, isNumberString, isSegmentNavigationKey } from './segment';
import { AnyExceptLiteral, DateAndTimeSegmentObj, DateStep, HourCycle, SegmentPart, SegmentValueObj } from './types';

/** Convert a canonical 24-hour value (0-23) to its 12-hour clock equivalent (1-12). */
function to12Hour(hour: number): number {
    const h = hour % 12;
    return h === 0 ? 12 : h;
}

/** Combine a 12-hour clock value (1-12) with a day period into a canonical 24-hour value (0-23). */
function to24Hour(hour: number, period: 'AM' | 'PM'): number {
    const h = hour % 12;
    return period === 'PM' ? h + 12 : h;
}

/** The day period a canonical 24-hour value belongs to. */
function dayPeriodForHour(hour: number): 'AM' | 'PM' {
    return hour >= 12 ? 'PM' : 'AM';
}

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
    placeholder: ModelSignal<DateValue> | WritableSignal<DateValue>;
    hourCycle: HourCycle;
    formatter: Formatter;
    segmentValues: WritableSignal<SegmentValueObj>;
    step: Signal<DateStep>;
    disabled: InputSignal<boolean>;
    readonly: InputSignal<boolean>;
    part: SegmentPart;
    modelValue: ModelSignal<DateValue | undefined> | WritableSignal<DateValue | undefined>;
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

type NumericSegmentConfig = {
    field: 'day' | 'month' | 'year' | 'hour' | 'minute' | 'second';
    label: string;
    valueMin: number;
    valueMax: number | ((date: DateValue) => number);
    valueText?: (date: DateValue) => string;
    /** Time parts only exist on date-time values; bail out when the segment is absent. */
    timePart?: boolean;
};

/**
 * Shared spinbutton attributes for the numeric segments (day/month/year/hour/minute/second).
 * Each segment differs only in its field, bounds, label and optional value-text formatting.
 */
function numericSegmentAttrs(props: SegmentAttrProps, config: NumericSegmentConfig) {
    const { segmentValues, placeholder } = props;
    const { field } = config;

    if (config.timePart && (!(field in segmentValues) || !(field in placeholder))) return {};

    const value = (segmentValues as Record<string, number | null>)[field];
    const isEmpty = value == null;
    const date = value != null ? placeholder.set({ [field]: value } as Partial<DateFields & TimeFields>) : placeholder;
    const valueNow = (date as unknown as Record<string, number>)[field];
    const valueMax = typeof config.valueMax === 'function' ? config.valueMax(date) : config.valueMax;
    const valueText = isEmpty ? 'Empty' : (config.valueText?.(date) ?? `${valueNow}`);

    return {
        ...commonSegmentAttrs(props),
        'aria-label': config.label,
        'aria-valuemin': config.valueMin,
        'aria-valuemax': valueMax,
        'aria-valuenow': valueNow,
        'aria-valuetext': valueText,
        'data-placeholder': isEmpty ? '' : undefined
    };
}

function daySegmentAttrs(props: SegmentAttrProps) {
    return numericSegmentAttrs(props, {
        field: 'day',
        label: 'day,',
        valueMin: 1,
        valueMax: (date) => getDaysInMonth(date)
    });
}

function monthSegmentAttrs(props: SegmentAttrProps) {
    return numericSegmentAttrs(props, {
        field: 'month',
        label: 'month, ',
        valueMin: 1,
        valueMax: 12,
        valueText: (date) => `${date.month} - ${props.formatter.fullMonth(toDate(date))}`
    });
}

function yearSegmentAttrs(props: SegmentAttrProps) {
    return numericSegmentAttrs(props, { field: 'year', label: 'year, ', valueMin: 1, valueMax: 9999 });
}

function hourSegmentAttrs(props: SegmentAttrProps) {
    const is12h = props.hourCycle === 12;
    return numericSegmentAttrs(props, {
        field: 'hour',
        label: 'hour, ',
        valueMin: is12h ? 1 : 0,
        valueMax: is12h ? 12 : 23,
        valueText: (date) =>
            `${(date as CalendarDateTime).hour} ${(props.segmentValues as DateAndTimeSegmentObj).dayPeriod ?? ''}`,
        timePart: true
    });
}

function minuteSegmentAttrs(props: SegmentAttrProps) {
    return numericSegmentAttrs(props, {
        field: 'minute',
        label: 'minute, ',
        valueMin: 0,
        valueMax: 59,
        timePart: true
    });
}

function secondSegmentAttrs(props: SegmentAttrProps) {
    return numericSegmentAttrs(props, {
        field: 'second',
        label: 'second, ',
        valueMin: 0,
        valueMax: 59,
        timePart: true
    });
}

function dayPeriodSegmentAttrs(props: SegmentAttrProps) {
    const { segmentValues } = props;
    if (!('dayPeriod' in segmentValues)) return {};

    const valueMin = 0;
    const valueMax = 12;
    const valueNow =
        segmentValues.hour != null ? (segmentValues.hour > 12 ? segmentValues.hour - 12 : segmentValues.hour) : 0;
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
        const step = props.step()[part] ?? 1;
        const sign = e.key === ARROW_UP ? step : -step;

        if (prevValue === null) return dateRef[part as keyof Omit<DateFields, 'era'>];

        if (part === 'hour' && 'hour' in dateRef) {
            const cycleArgs: [keyof DateFields | keyof TimeFields, number, CycleTimeOptions?] = [
                part,
                sign,
                { hourCycle }
            ];
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

    /**
     * Shared two-digit entry state machine for the numeric segments (day, month, hour,
     * minute, second). Types one digit into `prev`, deciding the new value and whether focus
     * should advance to the next segment.
     *
     * @param emptyZero  what a leading `0` produces on an empty segment — `0` for time parts
     *                   (midnight/`:00` are valid), `null` for day/month (no zeroth day/month).
     * @param moveOnOverflow  also advance focus when the two-digit total exceeds `max`
     *                        (day/month behavior; time parts only advance on `num > maxStart`).
     */
    function updateNumberSegment(
        num: number,
        prev: number | null,
        max: number,
        { emptyZero = true, moveOnOverflow = false }: { emptyZero?: boolean; moveOnOverflow?: boolean } = {}
    ): { value: number | null; moveToNext: boolean } {
        let moveToNext = false;
        const maxStart = Math.floor(max / 10);

        // If the user has left the segment, reset `prev` so typing restarts the segment.
        if (props.hasLeftFocus()) {
            props.hasLeftFocus.set(false);
            prev = null;
        }

        if (prev === null) {
            // A leading 0 is tracked so the next digit can advance to the next segment.
            if (num === 0) {
                props.lastKeyZero.set(true);
                return { value: emptyZero ? 0 : null, moveToNext };
            }
            // If the last key was 0, or the first digit can't start a valid two-digit number
            // (> the max start digit), advance to the next segment.
            if (props.lastKeyZero() || num > maxStart) {
                moveToNext = true;
            }
            props.lastKeyZero.set(false);
            return { value: num, moveToNext };
        }

        // Either the segment already holds two digits, or appending this digit overflows `max`:
        // reset the segment as if backspaced and then typed.
        const digits = prev.toString().length;
        const total = Number.parseInt(prev.toString() + num.toString());

        if (digits === 2 || total > max) {
            if (num > maxStart || (moveOnOverflow && total > max)) {
                moveToNext = true;
            }
            return { value: num, moveToNext };
        }

        moveToNext = true;
        return { value: total, moveToNext };
    }

    function updateDayOrMonth(max: number, num: number, prev: number | null) {
        return updateNumberSegment(num, prev, max, { emptyZero: false, moveOnOverflow: true });
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

    function updateHour(num: number, prev: number | null, max: number) {
        return updateNumberSegment(num, prev, max);
    }

    function updateMinuteOrSecond(num: number, prev: number | null) {
        return updateNumberSegment(num, prev, 59);
    }

    function minuteSecondIncrementation({ e, part, dateRef, prevValue }: MinuteSecondIncrementProps): number {
        const step = props.step()[part] ?? 1;
        const sign = e.key === ARROW_UP ? step : -step;
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

            // Keep the day period in sync with the (just-updated) 24-hour value.
            const updatedHour = (props.segmentValues() as DateAndTimeSegmentObj).hour;
            if ('dayPeriod' in props.segmentValues() && updatedHour != null) {
                props.segmentValues.update((prev) => ({ ...prev, dayPeriod: dayPeriodForHour(updatedHour) }));
            }

            return;
        }

        if (isNumberString(e.key)) {
            const num = Number.parseInt(e.key);
            const is12h = hourCycle === 12;
            const period: 'AM' | 'PM' = (values.dayPeriod as 'AM' | 'PM') ?? 'AM';

            // Run the two-digit entry machine in the user-visible clock space (1-12 in 12h
            // mode, 0-23 otherwise), then store the canonical 24-hour value. The day period
            // is owned by its own segment, so typing the hour must not flip it.
            const prevDisplay = prevValue === null ? null : is12h ? to12Hour(prevValue) : prevValue;
            const { value, moveToNext } = updateHour(num, prevDisplay, is12h ? 12 : 23);
            const hour = value === null ? null : is12h ? to24Hour(value, period) : value;

            props.segmentValues.update((prev) => ({ ...prev, hour }));

            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, hour: deleteValue(prevValue) }));
        }
    }

    // Minute and second segments behave identically; only the field differs.
    function handleMinuteOrSecondSegmentKeydown(e: KeyboardEvent, part: 'minute' | 'second') {
        const dateRef = props.placeholder();
        const values = props.segmentValues() as DateAndTimeSegmentObj;

        if (!isAcceptableSegmentKey(e.key) || isSegmentNavigationKey(e.key) || !(part in dateRef) || !(part in values))
            return;

        const prevValue = values[part];

        if (e.key === ARROW_UP || e.key === ARROW_DOWN) {
            const next = minuteSecondIncrementation({ e, part, dateRef: props.placeholder(), prevValue });
            props.segmentValues.update((prev) => ({ ...prev, [part]: next }));
        }

        if (isNumberString(e.key)) {
            const { value, moveToNext } = updateMinuteOrSecond(Number.parseInt(e.key), prevValue);
            props.segmentValues.update((prev) => ({ ...prev, [part]: value }));
            if (moveToNext) props.focusNext();
        }

        if (e.key === BACKSPACE) {
            props.hasLeftFocus.set(false);
            props.segmentValues.update((prev) => ({ ...prev, [part]: deleteValue(prevValue) }));
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

        const setPeriod = (period: 'AM' | 'PM') => {
            if (values.dayPeriod === period) return;
            // Re-anchor the canonical 24-hour value to the new period without ever leaving
            // range; keep it null while the hour segment is still empty.
            const hour = values.hour == null ? null : to24Hour(to12Hour(values.hour), period);
            props.segmentValues.update((prev) => ({ ...prev, dayPeriod: period, hour }));
        };

        if (e.key === ARROW_UP || e.key === ARROW_DOWN) {
            setPeriod(values.dayPeriod === 'AM' ? 'PM' : 'AM');
            return;
        }

        if (['a', 'A'].includes(e.key)) {
            setPeriod('AM');
            return;
        }

        if (['p', 'P'].includes(e.key)) {
            setPeriod('PM');
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
            minute: (e: KeyboardEvent) => handleMinuteOrSecondSegmentKeydown(e, 'minute'),
            second: (e: KeyboardEvent) => handleMinuteOrSecondSegmentKeydown(e, 'second'),
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
