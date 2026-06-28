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
import { DateValue, getLocalTimeZone, isEqualDay, Time, toCalendarDateTime, today } from '@internationalized/date';
import {
    ARROW_LEFT,
    ARROW_RIGHT,
    BooleanInput,
    createContent,
    createFormatter,
    DateStep,
    Direction,
    Formatter,
    getDefaultTime,
    Granularity,
    HourCycle,
    initializeSegmentValues,
    isBefore,
    isNullish,
    isSegmentNavigationKey,
    normalizeDateStep,
    normalizeHourCycle,
    provideExistingToken,
    RdxFormUiControlBase,
    RdxFormValueControl,
    resolveDisplayValid,
    SegmentValueObj,
    syncSegmentValues,
    TimeValue,
    watch
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { TIME_FIELDS_ROOT_CONTEXT } from './time-field-context.token';
import { RdxTimeFieldInputDirective } from './time-field-input.directive';

function convertValue(value: TimeValue, date: DateValue = today(getLocalTimeZone())) {
    if (value && 'day' in value) {
        return value;
    }

    return toCalendarDateTime(date, value);
}

/**
 * Map the internal edit buffer (`convertedModelValue`, always a date-bearing value
 * so the segment editor has a date context) back onto the public `value` model.
 * A date-bearing model keeps its shape; a time-only model is exposed as a plain `Time`.
 */
function toModelValue(value: TimeValue, current: TimeValue | undefined): TimeValue {
    if (current && 'day' in current) {
        return value;
    }

    return new Time(value.hour, value.minute, value.second, value.millisecond);
}

function isSameTimeValue(a: TimeValue | undefined, b: TimeValue | undefined): boolean {
    if (isNullish(a) || isNullish(b)) return a === b;
    return (a as { compare(other: TimeValue): number }).compare(b) === 0;
}

@Directive({
    selector: '[rdxTimeFieldRoot]',
    exportAs: 'rdxTimeFieldRoot',
    providers: [provideExistingToken(TIME_FIELDS_ROOT_CONTEXT, RdxTimeFieldRootDirective)],
    host: {
        role: 'group',
        '[attr.aria-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.aria-invalid]': 'displayValid() === false ? "true" : undefined',
        '[attr.data-invalid]': 'displayValid() === false ? "" : undefined',
        '[attr.data-valid]': 'displayValid() === true ? "" : undefined',
        '[attr.data-touched]': 'touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'dirtyState() ? "" : undefined',
        '[attr.dir]': 'dir()',

        '(keydown)': 'onKeydown($event)',
        '(focusout)': 'markAsTouched()'
    }
})
export class RdxTimeFieldRootDirective
    extends RdxFormUiControlBase
    implements RdxFormValueControl<TimeValue | undefined>
{
    /**
     * The controlled checked state of the calendar.
     */
    readonly value = model<TimeValue | undefined>();

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

    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

    /**
     * The minimum valid date that can be entered.
     */
    readonly minValue = input<TimeValue>();

    /**
     * The maximum valid date that can be entered.
     */
    readonly maxValue = input<TimeValue>();

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
        getDefaultTime({
            defaultPlaceholder: undefined,
            defaultValue: this.value()
        })
    );

    /**
     * The placeholder date, which is used to determine what month to display when no date is selected. This updates as the user navigates the calendar and can be used to programmatically control the calendar view
     */
    readonly placeholder = model<TimeValue | undefined>(this.defaultDate().copy());

    /**
     * Always-defined placeholder used for segment math. A controlled `[placeholder]` can be reset to
     * `undefined`; fall back to the default time so the converted placeholder is never built from
     * `undefined`.
     * @ignore
     */
    readonly effectivePlaceholder = computed(() => this.placeholder() ?? this.defaultDate().copy());

    // Internal state

    /**
     * Segment input parts, collected from the projected content in DOM order. This
     * stays in sync with `segmentContents()` (granularity / locale / value changes
     * add or remove segments) instead of being captured once after view init.
     * @ignore
     */
    private readonly segmentInputs = contentChildren(RdxTimeFieldInputDirective);

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
    readonly inferredGranularity = computed(() => this.granularity() ?? 'minute');

    readonly convertedMinValue = computed(() => (this.minValue() ? convertValue(this.minValue()!) : undefined));
    readonly convertedMaxValue = computed(() => (this.maxValue() ? convertValue(this.maxValue()!) : undefined));

    readonly convertedModelValue = linkedSignal({
        source: () => {
            if (isNullish(this.value())) return this.value();

            return convertValue(this.value()!);
        },
        computation: (value: TimeValue | undefined) => {
            return value;
        }
    });

    readonly convertedPlaceholder = linkedSignal({
        source: () => {
            return convertValue(this.effectivePlaceholder());
        },
        computation: (value: TimeValue) => {
            return value;
        }
    });

    /**
     * The per-segment values. Writable so segment editing (via `useDateField`) can
     * update individual parts, but re-synced from the model whenever the value,
     * granularity or formatter change — so a controlled `value` set after init is
     * reflected, and an empty field re-initializes when granularity changes.
     * @ignore
     */
    readonly segmentValues = linkedSignal<
        { value: TimeValue | undefined; granularity: Granularity; formatter: Formatter },
        SegmentValueObj
    >({
        source: () => ({
            value: this.convertedModelValue(),
            granularity: this.inferredGranularity(),
            formatter: this.formatter()
        }),
        computation: ({ value, granularity, formatter }) =>
            value
                ? { ...syncSegmentValues({ value: <DateValue>value, formatter }) }
                : { ...initializeSegmentValues(granularity, true) }
    });

    /**
     * @ignore
     */
    readonly isInvalid = computed(() => {
        if (!this.value()) return false;

        if (
            this.convertedMinValue() &&
            isBefore(<DateValue>this.convertedModelValue(), <DateValue>this.convertedMinValue())
        )
            return true;

        if (
            this.convertedMaxValue() &&
            isBefore(<DateValue>this.convertedMaxValue(), <DateValue>this.convertedModelValue())
        )
            return true;

        return false;
    });

    /**
     * @ignore Effective invalid: the built-in range check OR the form-driven `invalid` / `errors`
     * (Signal Forms). Reflected on the root and segments.
     */
    readonly invalidState = computed(() => this.isInvalid() || this.formUi.invalidState());
    /**
     * @ignore Tri-state display validity: the enclosing Field's gated state when inside a `rdxFieldRoot`,
     * else the time-field's own (parse + form) invalidity. Overrides the base default (`formUi` only).
     */
    override readonly displayValid = computed(() => resolveDisplayValid(this.fieldValidity, this.invalidState));
    /** @ignore */
    readonly touchedState = this.formUi.touchedState;
    /** @ignore */
    readonly dirtyState = this.formUi.dirtyState;

    /** @ignore Whether the user has focused a segment — gates dirty tracking so a form/initial seed of `value` doesn't mark dirty. */
    private readonly userInteracted = signal(false);

    /** @ignore Mark the field touched (model + `touch` output) for Signal Forms. Called on segment blur. */
    markAsTouched(): void {
        this.formUi.markAsTouched();
    }

    /**
     * @ignore
     */
    readonly allSegmentContent = computed(() =>
        createContent({
            granularity: this.inferredGranularity(),
            dateRef: <DateValue>this.convertedPlaceholder(),
            formatter: this.formatter(),
            hideTimeZone: this.hideTimeZone(),
            hourCycle: this.hourCycle(),
            segmentValues: this.segmentValues(),
            locale: this.locale,
            isTimeValue: true
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
        super();

        // Mark dirty when the value changes after the user has interacted (a form/initial seed of
        // `value` lands before any segment focus, so it is excluded).
        watch([this.value], () => {
            if (this.userInteracted()) {
                this.formUi.markDirty();
            }
        });

        watch([this.convertedModelValue], ([value]) => {
            if (
                !isNullish(value) &&
                (!isEqualDay(<DateValue>this.convertedPlaceholder(), <DateValue>value) ||
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    this.convertedPlaceholder().compare(value) !== 0)
            )
                this.placeholder.set(value.copy());

            // Segment editing (via `useDateField`) writes the internal `convertedModelValue`
            // buffer; mirror it back onto the public `value` model so two-way binding and
            // `valueChange` fire. The guard keeps this idempotent and breaks the feedback loop
            // (`value` → `convertedModelValue` source → here) once the values agree.
            const next = isNullish(value) ? undefined : toModelValue(value, this.value());
            if (!isSameTimeValue(this.value(), next)) {
                this.value.set(next);
            }
        });
    }

    /**
     * @ignore
     */
    onKeydown(event: Event) {
        const keyEvent = event as KeyboardEvent;
        if (!isSegmentNavigationKey(keyEvent.key)) return;
        const code = keyEvent.code;

        if (code === ARROW_LEFT) {
            this.prevFocusableSegment()?.focus();
        }

        if (code === ARROW_RIGHT) {
            this.nextFocusableSegment()?.focus();
        }
    }

    /**
     * @ignore
     */
    setFocusedElement(el: HTMLElement) {
        this.currentFocusedElement.set(el);
        this.userInteracted.set(true);
    }
}
