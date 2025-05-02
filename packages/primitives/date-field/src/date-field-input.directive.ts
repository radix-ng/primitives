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
        '(mousedown)': "part() !== 'literal' && handleSegmentClick($event)",
        '(keydown)': "part() !== 'literal' && handleSegmentKeydown($event)",
        '(focus)': 'onFocus($event)'
    }
})
export class RdxDateFieldInputDirective {
    private readonly rootContext = injectDateFieldsRootContext();

    readonly part = input<SegmentPart>();

    readonly disabled = computed(() => this.rootContext.disabled());

    readonly readonly = computed(() => this.rootContext.readonly());

    readonly hasLeftFocus = signal<boolean>(true);

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
            modelValue: this.rootContext.value,
            focusNext: this.rootContext.focusNext
        });
    });

    private readonly attributes = computed(() => this.fieldData().attributes());

    handleSegmentClick: (e: MouseEvent) => void;
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

    onFocus(e: FocusEvent) {
        this.rootContext.setFocusedElement(e.target as HTMLElement);
    }
}
