import { Direction } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    booleanAttribute,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    model,
    OnInit,
    signal
} from '@angular/core';
import { DateValue } from '@internationalized/date';
import {
    ARROW_LEFT,
    ARROW_RIGHT,
    createContent,
    createFormatter,
    DateMatcher,
    Formatter,
    getDefaultDate,
    getSegmentElements,
    Granularity,
    hasTime,
    HourCycle,
    initializeSegmentValues,
    isBefore,
    isNullish,
    isSegmentNavigationKey,
    provideToken,
    SegmentValueObj,
    syncSegmentValues,
    watch
} from '@radix-ng/primitives/core';
import { DATE_FIELDS_ROOT_CONTEXT } from './date-field-context.token';

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
export class RdxDateFieldRootDirective implements OnInit, AfterViewInit {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

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
     * @ignore
     */
    readonly segmentElements = signal<Set<HTMLElement>>(new Set());

    /**
     * @ignore
     */
    readonly currentFocusedElement = signal<HTMLElement | null>(null);

    /**
     * @ignore
     */
    formatter: Formatter;

    /**
     * @ignore
     */
    readonly segmentValues = signal<SegmentValueObj>({
        year: null,
        month: null,
        day: null,
        hour: null,
        minute: null,
        second: null,
        dayPeriod: null
    } as SegmentValueObj);

    /**
     * @ignore
     */
    readonly inferredGranularity = computed(() => {
        const placeholder = this.placeholder();

        if (this.granularity()) return placeholder && !hasTime(placeholder) ? 'day' : this.granularity();

        return placeholder && hasTime(placeholder) ? 'minute' : 'day';
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
            formatter: this.formatter,
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
        Array.from(this.segmentElements()).findIndex(
            (el) =>
                el.getAttribute('data-rdx-date-field-segment') ===
                this.currentFocusedElement()?.getAttribute('data-rdx-date-field-segment')
        )
    );

    /**
     * @ignore
     */
    readonly prevFocusableSegment = computed(() => {
        const sign = this.dir() === 'rtl' ? -1 : 1;
        const prevCondition =
            sign > 0 ? this.currentSegmentIndex() < 0 : this.currentSegmentIndex() > this.segmentElements().size - 1;
        if (prevCondition) return null;

        const segmentToFocus = Array.from(this.segmentElements())[this.currentSegmentIndex() - sign];
        return segmentToFocus;
    });

    /**
     * @ignore
     */
    readonly nextFocusableSegment = computed(() => {
        const sign = this.dir() === 'rtl' ? -1 : 1;
        const nextCondition =
            sign < 0 ? this.currentSegmentIndex() < 0 : this.currentSegmentIndex() > this.segmentElements().size - 1;
        if (nextCondition) return null;
        const segmentToFocus = Array.from(this.segmentElements())[this.currentSegmentIndex() + sign];
        return segmentToFocus;
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

    ngOnInit() {
        const defDate = getDefaultDate({
            defaultPlaceholder: undefined,
            granularity: this.granularity(),
            defaultValue: this.value(),
            locale: this.locale()
        });

        this.placeholder.set(defDate.copy());

        this.formatter = createFormatter(this.locale());

        const initialSegments = initializeSegmentValues(this.inferredGranularity()!);

        this.segmentValues.set(
            this.value()
                ? { ...syncSegmentValues({ value: <DateValue>this.value(), formatter: this.formatter }) }
                : { ...initialSegments }
        );
    }

    ngAfterViewInit() {
        getSegmentElements(this.elementRef.nativeElement).forEach((item) =>
            this.segmentElements().add(item as HTMLElement)
        );
    }

    /**
     * @ignore
     */
    onKeydown(event: KeyboardEvent) {
        const code = event.code;
        if ([ARROW_LEFT, ARROW_RIGHT].includes(code)) {
            if (!isSegmentNavigationKey(event.key)) return;

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
