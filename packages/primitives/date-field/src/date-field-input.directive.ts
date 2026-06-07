import { computed, Directive, effect, ElementRef, inject, input, signal } from '@angular/core';
import { isNullish, SegmentPart, useDateField } from '@radix-ng/primitives/core';
import { injectDateFieldsRootContext } from './date-field-context.token';

/**
 * Attribute keys produced by `useDateField().attributes()` that are instead owned by host
 * bindings. Writing them imperatively would clobber the host value — re-enabling a disabled
 * segment via `contenteditable`, or overwriting a consumer's inline `style`.
 */
const hostManagedAttrs = new Set(['contenteditable', 'style']);

@Directive({
    selector: '[rdxDateFieldInput]',
    host: {
        '[attr.contenteditable]': 'disabled() || readonly() ? false : part() !== "literal"',
        '[style.caret-color]': 'part() !== "literal" ? "transparent" : undefined',
        '[attr.data-rdx-date-field-segment]': 'part()',
        '[attr.aria-disabled]': 'disabled() ? "true" : undefined',
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
    private readonly elementRef = inject(ElementRef);

    /**
     * The host element of this segment. Consumed by the root to collect focusable
     * segments in DOM order.
     * @ignore
     */
    readonly element: HTMLElement = this.elementRef.nativeElement;

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
            formatter: this.rootContext.formatter(),
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
     * Attribute keys applied imperatively on the previous effect run, so keys that
     * disappear from `attributes()` are removed instead of lingering as stale state.
     * @ignore
     */
    private appliedAttrs = new Set<string>();

    constructor() {
        effect(() => {
            const element = this.elementRef.nativeElement as HTMLElement;
            const attrs = this.attributes();
            const next = new Set<string>();

            for (const [attr, value] of Object.entries(attrs)) {
                // Skip keys a host binding already owns, so this effect never fights it.
                if (hostManagedAttrs.has(attr)) {
                    continue;
                }

                // A nullish value means the attribute should be absent (e.g. `data-placeholder`
                // once a segment is filled); removing it avoids a literal `"undefined"` string.
                if (isNullish(value)) {
                    element.removeAttribute(attr);
                } else {
                    element.setAttribute(attr, String(value));
                    next.add(attr);
                }
            }

            for (const attr of this.appliedAttrs) {
                if (!next.has(attr)) {
                    element.removeAttribute(attr);
                }
            }

            this.appliedAttrs = next;
        });
    }

    /**
     * @ignore
     */
    handleSegmentClick(event: Event) {
        this.fieldData().handleSegmentClick(event as MouseEvent);
    }

    /**
     * @ignore
     */
    handleSegmentKeydown(event: Event) {
        this.fieldData().handleSegmentKeydown(event as KeyboardEvent);
    }

    /**
     * @ignore
     */
    onFocus(e: Event) {
        this.rootContext.setFocusedElement(e.target as HTMLElement);
    }

    /**
     * @ignore
     */
    onFocusOut() {
        this.hasLeftFocus.set(true);
    }
}
