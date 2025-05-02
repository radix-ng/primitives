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
    signal
} from '@angular/core';
import { DateValue } from '@internationalized/date';
import {
    createContent,
    createFormatter,
    DateMatcher,
    getDefaultDate,
    getSegmentElements,
    Granularity,
    hasTime,
    HourCycle,
    initializeSegmentValues,
    isBefore,
    isNullish,
    provideToken,
    SegmentPart,
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
        '[attr.dir]': 'dir()'
    }
})
export class RdxDateFieldRootDirective implements AfterViewInit {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    readonly value = model<DateValue | undefined>();

    readonly isDateUnavailable = input<DateMatcher | undefined>(undefined);

    readonly hourCycle = input<HourCycle>();

    readonly granularity = input<Granularity>();

    readonly locale = input<string>('en');

    readonly dir = input<Direction>('ltr');

    readonly minValue = input<DateValue>();

    readonly maxValue = input<DateValue>();

    readonly hideTimeZone = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly defaultDate = getDefaultDate({
        defaultPlaceholder: undefined,
        granularity: this.granularity(),
        defaultValue: this.value(),
        locale: this.locale()
    });

    readonly placeholder = model<DateValue | undefined>(this.defaultDate.copy());

    readonly inferredGranularity = computed(() => {
        const placeholder = this.placeholder();

        if (this.granularity()) return placeholder && !hasTime(placeholder) ? 'day' : this.granularity();

        return placeholder && hasTime(placeholder) ? 'minute' : 'day';
    });

    readonly isInvalid = computed(() => {
        if (!this.value()) return false;

        if (this.isDateUnavailable()?.(<DateValue>this.value())) return true;

        if (this.minValue() && isBefore(<DateValue>this.value(), <DateValue>this.minValue())) return true;

        if (this.maxValue() && isBefore(<DateValue>this.maxValue(), <DateValue>this.value())) return true;

        return false;
    });

    readonly formatter = createFormatter(this.locale());

    segments: { part: SegmentPart; value: string }[];

    readonly segmentElements = signal<Set<HTMLElement>>(new Set());

    initialSegments = initializeSegmentValues(this.inferredGranularity()!);

    segmentValues = signal<SegmentValueObj>(
        this.value()
            ? { ...syncSegmentValues({ value: <DateValue>this.value(), formatter: this.formatter }) }
            : { ...this.initialSegments }
    );

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

    readonly segmentContents = computed(() => this.allSegmentContent().arr);

    readonly editableSegmentContents = computed(() => this.segmentContents().filter(({ part }) => part !== 'literal'));

    readonly currentFocusedElement = signal<HTMLElement | null>(null);

    readonly currentSegmentIndex = computed(() =>
        Array.from(this.segmentElements()).findIndex(
            (el) =>
                el.getAttribute('data-rdx-date-field-segment') ===
                this.currentFocusedElement()?.getAttribute('data-rdx-date-field-segment')
        )
    );

    readonly nextFocusableSegment = computed(() => {
        const sign = this.dir() === 'rtl' ? -1 : 1;
        const nextCondition =
            sign < 0 ? this.currentSegmentIndex() < 0 : this.currentSegmentIndex() > this.segmentElements().size - 1;
        if (nextCondition) return null;
        const segmentToFocus = Array.from(this.segmentElements())[this.currentSegmentIndex() + sign];
        return segmentToFocus;
    });

    constructor() {
        watch([this.value], ([modelValue]) => {
            if (!isNullish(modelValue) && this.placeholder()?.compare(modelValue) !== 0) {
                this.placeholder.set(modelValue.copy());
            }
        });
    }

    ngAfterViewInit() {
        getSegmentElements(this.elementRef.nativeElement).forEach((item) =>
            this.segmentElements().add(item as HTMLElement)
        );
    }

    setFocusedElement(el: HTMLElement) {
        this.currentFocusedElement.set(el);
    }

    focusNext() {
        //nextFocusableSegment.value?.focus()
    }
}
