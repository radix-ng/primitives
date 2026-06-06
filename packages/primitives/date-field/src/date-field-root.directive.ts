import { Direction } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    contentChildren,
    Directive,
    input,
    linkedSignal,
    model,
    Signal,
    signal
} from '@angular/core';
import { DateValue } from '@internationalized/date';
import {
    ARROW_LEFT,
    ARROW_RIGHT,
    createContent,
    createFormatter,
    DateMatcher,
    DateStep,
    Formatter,
    getDefaultDate,
    Granularity,
    hasTime,
    HourCycle,
    initializeSegmentValues,
    isBefore,
    isNullish,
    isSegmentNavigationKey,
    normalizeDateStep,
    normalizeHourCycle,
    provideToken,
    SegmentValueObj,
    syncSegmentValues,
    watch
} from '@radix-ng/primitives/core';
import { DATE_FIELDS_ROOT_CONTEXT } from './date-field-context.token';
import { RdxDateFieldInputDirective } from './date-field-input.directive';

@Directive({
    selector: '[rdxDateFieldRoot]',
    exportAs: 'rdxDateFieldRoot',
    providers: [provideToken(DATE_FIELDS_ROOT_CONTEXT, RdxDateFieldRootDirective)],
    host: {
        role: 'group',
        '[attr.aria-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-invalid]': 'isInvalid() ? "" : undefined',
        '[attr.dir]': 'dir()',

        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxDateFieldRootDirective {
    /**
     * The controlled checked state of the calendar.
     */
    readonly value = model<DateValue | undefined>();

    /**
     * A callback fired when the date field's value is invalid.
     */
    readonly isDateUnavailable = input<DateMatcher | undefined>(undefined);

    /**
     * The hour cycle to use for formatting times. Defaults to the locale preference
     */
    readonly hourCycle = input<HourCycle>();

    /**
     * The granularity to use for formatting the field. Defaults to 'day' if a CalendarDate is provided, otherwise defaults to 'minute'.
     * The field will render segments for each part of the date up to and including the specified granularity.
     */
    readonly granularity = input<Granularity>();

    /**
     * The locale to use for formatting dates.
     */
    readonly locale = input<string>('en');

    readonly dir = input<Direction>('ltr');

    /**
     * The minimum valid date that can be entered.
     */
    readonly minValue = input<DateValue>();

    /**
     * The maximum valid date that can be entered.
     */
    readonly maxValue = input<DateValue>();

    /**
     * Whether or not to hide the time zone segment of the field.
     */
    readonly hideTimeZone = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether or not the field is readonly.
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The stepping interval for the time fields. Defaults to 1
     */
    readonly step = input<DateStep>();

    readonly step$ = computed(() => normalizeDateStep(this.step()));

    /**
     * Locale- and hour-cycle-aware formatter. Recomputed whenever `locale` or
     * `hourCycle` change so segments always render with the current settings.
     * @ignore
     */
    readonly formatter: Signal<Formatter> = computed(() =>
        createFormatter(this.locale(), {
            hourCycle: normalizeHourCycle(this.hourCycle())
        })
    );

    /**
     * @ignore
     */
    readonly defaultDate = computed(() =>
        getDefaultDate({
            defaultPlaceholder: undefined,
            granularity: this.granularity(),
            defaultValue: this.value(),
            locale: this.locale()
        })
    );

    /**
     * The placeholder date, which is used to determine what month to display when no date is selected. This updates as the user navigates the calendar and can be used to programmatically control the calendar view
     */
    readonly placeholder = model<DateValue | undefined>(this.defaultDate().copy());

    // Internal state

    /**
     * Segment input parts, collected from the projected content in DOM order. This
     * stays in sync with `segmentContents()` (granularity / locale / value changes
     * add or remove segments) instead of being captured once after view init.
     * @ignore
     */
    private readonly segmentInputs = contentChildren(RdxDateFieldInputDirective);

    /**
     * The focusable (non-literal) segment elements, in DOM order.
     * @ignore
     */
    readonly segmentElements = computed(() =>
        this.segmentInputs()
            .filter((seg) => seg.part() !== 'literal')
            .map((seg) => seg.element)
    );

    /**
     * @ignore
     */
    readonly currentFocusedElement = signal<HTMLElement | null>(null);

    /**
     * @ignore
     */
    readonly inferredGranularity = computed(() => {
        const placeholder = this.placeholder();

        if (this.granularity()) return placeholder && !hasTime(placeholder) ? 'day' : this.granularity();

        return placeholder && hasTime(placeholder) ? 'minute' : 'day';
    });

    /**
     * The per-segment values. Writable so segment editing (via `useDateField`) can
     * update individual parts, but re-synced from the model whenever the value,
     * granularity or formatter change — so a controlled `value` set after init is
     * reflected, and an empty field re-initializes when granularity changes.
     * @ignore
     */
    readonly segmentValues = linkedSignal<
        { value: DateValue | undefined; granularity: Granularity; formatter: Formatter },
        SegmentValueObj
    >({
        source: () => ({
            value: this.value(),
            granularity: <Granularity>this.inferredGranularity(),
            formatter: this.formatter()
        }),
        computation: ({ value, granularity, formatter }) =>
            value ? { ...syncSegmentValues({ value, formatter }) } : { ...initializeSegmentValues(granularity) }
    });

    /**
     * @ignore
     */
    readonly isInvalid = computed(() => {
        if (!this.value()) return false;

        if (this.isDateUnavailable()?.(<DateValue>this.value())) return true;

        if (this.minValue() && isBefore(<DateValue>this.value(), <DateValue>this.minValue())) return true;

        if (this.maxValue() && isBefore(<DateValue>this.maxValue(), <DateValue>this.value())) return true;

        return false;
    });

    /**
     * @ignore
     */
    readonly allSegmentContent = computed(() =>
        createContent({
            granularity: <Granularity>this.inferredGranularity(),
            dateRef: <DateValue>this.placeholder(),
            formatter: this.formatter(),
            hideTimeZone: this.hideTimeZone(),
            hourCycle: this.hourCycle(),
            segmentValues: this.segmentValues(),
            locale: this.locale
        })
    );

    /**
     * An array of segments that should be readonly, which prevent user input on them.
     */
    readonly segmentContents = computed(() => this.allSegmentContent().arr);

    /**
     * @ignore
     */
    readonly currentSegmentIndex = computed(() =>
        this.segmentElements().findIndex((el) => el === this.currentFocusedElement())
    );

    /**
     * @ignore
     */
    readonly prevFocusableSegment = computed(() => {
        const sign = this.dir() === 'rtl' ? -1 : 1;
        const elements = this.segmentElements();
        const index = this.currentSegmentIndex();
        const prevCondition = sign > 0 ? index < 0 : index > elements.length - 1;
        if (prevCondition) return null;

        return elements[index - sign];
    });

    /**
     * @ignore
     */
    readonly nextFocusableSegment = computed(() => {
        const sign = this.dir() === 'rtl' ? -1 : 1;
        const elements = this.segmentElements();
        const index = this.currentSegmentIndex();
        const nextCondition = sign < 0 ? index < 0 : index > elements.length - 1;
        if (nextCondition) return null;

        return elements[index + sign];
    });

    /**
     * @ignore
     */
    readonly focusNext = () => {
        this.nextFocusableSegment()?.focus();
    };

    constructor() {
        watch([this.value], ([modelValue]) => {
            if (!isNullish(modelValue) && this.placeholder()?.compare(modelValue) !== 0) {
                this.placeholder.set(modelValue.copy());
            }
        });
    }

    /**
     * @ignore
     */
    onKeydown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        const code = keyEvent.code;
        if ([ARROW_LEFT, ARROW_RIGHT].includes(code)) {
            if (!isSegmentNavigationKey(keyEvent.key)) return;

            if (code === ARROW_LEFT) {
                this.prevFocusableSegment()?.focus();
            }

            if (code === ARROW_RIGHT) {
                this.nextFocusableSegment()?.focus();
            }
        }
    }

    /**
     * @ignore
     */
    setFocusedElement(el: HTMLElement) {
        this.currentFocusedElement.set(el);
    }
}
