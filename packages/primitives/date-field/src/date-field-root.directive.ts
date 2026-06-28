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
    BooleanInput,
    createContent,
    createFormatter,
    DateMatcher,
    DateStep,
    Direction,
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
    provideExistingToken,
    RdxFormUiControlBase,
    RdxFormValueControl,
    resolveDisplayValid,
    SegmentValueObj,
    syncSegmentValues,
    watch
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { DATE_FIELDS_ROOT_CONTEXT } from './date-field-context.token';
import { RdxDateFieldInputDirective } from './date-field-input.directive';

@Directive({
    selector: '[rdxDateFieldRoot]',
    exportAs: 'rdxDateFieldRoot',
    providers: [provideExistingToken(DATE_FIELDS_ROOT_CONTEXT, RdxDateFieldRootDirective)],
    host: {
        role: 'group',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
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
export class RdxDateFieldRootDirective
    extends RdxFormUiControlBase
    implements RdxFormValueControl<DateValue | undefined>
{
    /**
     * The controlled value of the date field.
     */
    readonly value = model<DateValue | undefined>();

    /**
     * A matcher that marks specific dates as unavailable; a matched value makes the field invalid.
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

    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

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

    /**
     * Always-defined placeholder used for segment math. A controlled `[placeholder]` can be reset to
     * `undefined`; fall back to the default date so segment attributes and key handlers never
     * dereference `undefined`.
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
        // Use the always-defined placeholder: a controlled `[placeholder]` reset to `undefined` while
        // `value` is a date-time must still infer 'minute' (from the default's shape), not drop to 'day'.
        const placeholder = this.effectivePlaceholder();

        if (this.granularity()) return !hasTime(placeholder) ? 'day' : this.granularity();

        return hasTime(placeholder) ? 'minute' : 'day';
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
     * @ignore Effective invalid: the built-in range/availability check OR the form-driven
     * `invalid` / `errors` (Signal Forms). Reflected on the root and segments.
     */
    readonly invalidState = computed(() => this.isInvalid() || this.formUi.invalidState());
    /**
     * @ignore Tri-state display validity: the enclosing Field's gated state when inside a `rdxFieldRoot`,
     * else the date-field's own (parse + form) invalidity. Overrides the base (whose default uses only
     * `formUi.invalidState`) so the standalone path keeps the built-in range/availability check.
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
            granularity: <Granularity>this.inferredGranularity(),
            dateRef: this.effectivePlaceholder(),
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
        super();

        // Mark dirty when the value changes after the user has interacted (a form/initial seed of
        // `value` lands before any segment focus, so it is excluded).
        watch([this.value], () => {
            if (this.userInteracted()) {
                this.formUi.markDirty();
            }
        });

        watch([this.value], ([modelValue]) => {
            if (!isNullish(modelValue) && this.placeholder()?.compare(modelValue) !== 0) {
                this.placeholder.set(modelValue.copy());
            }
        });

        // The placeholder is seeded once at construction, before `locale` binds. When the locale
        // selects a different calendar system (e.g. Buddhist, Japanese) and the field is still
        // empty, re-seed it so segments and `getDaysInMonth` use that calendar.
        watch([this.locale], () => {
            if (!isNullish(this.value())) return;
            const next = this.defaultDate();
            if (this.placeholder()?.calendar.identifier !== next.calendar.identifier) {
                this.placeholder.set(next.copy());
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
        this.userInteracted.set(true);
    }
}
