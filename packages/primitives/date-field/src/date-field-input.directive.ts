import { computed, Directive, effect, ElementRef, input, signal } from '@angular/core';
import { SegmentPart, useDateField } from '@radix-ng/primitives/core';
import { injectDateFieldsRootContext } from './date-field-context.token';

@Directive({
    selector: '[rdxDateFieldInput]',
    host: {
        '[attr.contenteditable]': 'disabled() || readonly() ? false : part() !== "literal"',
        '[attr.data-rdx-date-field-segment]': 'part()',
        '[attr.aria-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-invalid]': 'isInvalid() ? "" : undefined',
        '[attr.aria-invalid]': 'isInvalid() ? true : undefined',

        '(mousedown)': 'part() !== "literal" && handleSegmentClick($event)',
        '(keydown)': 'part() !== "literal" && handleSegmentKeydown($event)',
        '(focus)': 'part() !== "literal" && onFocus($event)',
        '(focusout)': 'part() !== "literal" && onFocusOut()'
    }
})
export class RdxDateFieldInputDirective {
    private readonly rootContext = injectDateFieldsRootContext();

    /**
     * The part of the date to render
     * `'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'dayPeriod' | 'literal' | 'timeZoneName'`
     */
    readonly part = input<SegmentPart>();

    /**
     * @ignore
     */
    readonly disabled = computed(() => this.rootContext.disabled());

    /**
     * @ignore
     */
    readonly readonly = computed(() => this.rootContext.readonly());

    /**
     * @ignore
     */
    readonly isInvalid = computed(() => this.rootContext.isInvalid());

    /**
     * @ignore
     */
    readonly hasLeftFocus = signal<boolean>(true);

    /**
     * @ignore
     */
    readonly lastKeyZero = signal<boolean>(false);

    private readonly fieldData = computed(() => {
        return useDateField({
            hasLeftFocus: this.hasLeftFocus,
            lastKeyZero: this.lastKeyZero,
            placeholder: this.rootContext.placeholder,
            hourCycle: this.rootContext.hourCycle(),
            segmentValues: this.rootContext.segmentValues,
            formatter: this.rootContext.formatter,
            part: <SegmentPart>this.part(),
            disabled: this.rootContext.disabled,
            readonly: this.rootContext.readonly,
            step: this.rootContext.step$,
            modelValue: this.rootContext.value,
            focusNext: this.rootContext.focusNext
        });
    });

    private readonly attributes = computed(() => this.fieldData().attributes());

    /**
     * @ignore
     */
    handleSegmentClick: (e: MouseEvent) => void;

    /**
     * @ignore
     */
    handleSegmentKeydown: (e: KeyboardEvent) => void;

    constructor(private el: ElementRef) {
        effect(() => {
            const { handleSegmentClick, handleSegmentKeydown } = this.fieldData();
            this.handleSegmentKeydown = handleSegmentKeydown;
            this.handleSegmentClick = handleSegmentClick;
        });

        effect(() => {
            const attrs = this.attributes();
            Object.entries(attrs).forEach(([attr, value]) => {
                this.el.nativeElement.setAttribute(attr, String(value));
            });
        });
    }

    /**
     * @ignore
     */
    onFocus(e: FocusEvent) {
        this.rootContext.setFocusedElement(e.target as HTMLElement);
    }

    /**
     * @ignore
     */
    onFocusOut() {
        this.hasLeftFocus.set(true);
    }
}
