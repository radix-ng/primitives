import { afterRenderEffect, computed, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { fieldDescribedBy } from '@radix-ng/primitives/field';
import { injectSliderRootContext } from './slider-context';
import { RdxSliderThumb } from './slider-thumb';
import { ALL_KEYS, COMPOSITE_KEYS, getDefaultAriaValueText, getNewValue, roundValueToStep } from './slider.utils';

/**
 * The native `input[type=range]` nested inside a thumb. It is visually hidden but
 * remains the focusable element that drives keyboard interaction, accessibility
 * and form submission.
 *
 * @see https://base-ui.com/react/components/slider
 */
@Directive({
    selector: 'input[rdxSliderThumbInput]',
    exportAs: 'rdxSliderThumbInput',
    host: {
        type: 'range',
        style: 'position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; opacity: 0; cursor: inherit;',
        '[id]': 'id()',
        '[style.writing-mode]': 'writingMode()',
        '[attr.min]': 'root.min()',
        '[attr.max]': 'root.max()',
        '[attr.step]': 'nativeStep()',
        '[attr.value]': 'thumb.value()',
        '[disabled]': 'thumb.disabled() || thumb.value() === undefined',
        '[attr.name]': 'root.effectiveName()',
        '[attr.form]': 'root.form()',
        '[attr.aria-orientation]': 'root.orientation()',
        '[attr.aria-valuenow]': 'thumb.value()',
        '[attr.aria-valuetext]': 'valueText()',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-labelledby]': 'ariaLabelledBy()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'root.displayValid() === false ? "true" : undefined',
        '(keydown)': 'onKeyDown($event)',
        '(input)': 'onChange($event)',
        '(change)': 'onChange($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    }
})
export class RdxSliderThumbInput {
    protected readonly root = injectSliderRootContext();
    protected readonly thumb = inject(RdxSliderThumb);
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    readonly id = input<string>(injectId('rdx-slider-thumb-input-'));
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
    readonly ariaLabelledByInput = input<string | undefined>(undefined, { alias: 'aria-labelledby' });
    readonly ariaDescribedBy = input<string>(undefined, { alias: 'aria-describedby' });
    readonly ariaValueTextInput = input<string | undefined>(undefined, { alias: 'aria-valuetext' });

    protected readonly writingMode = computed(() =>
        this.root.orientation() === 'vertical' ? (this.root.dir() === 'rtl' ? 'vertical-rl' : 'vertical-lr') : undefined
    );

    protected readonly ariaLabelledBy = computed(
        () => this.ariaLabelledByInput() ?? (this.ariaLabel() == null ? this.root.labelledBy() : undefined)
    );
    protected readonly describedBy = computed(() =>
        fieldDescribedBy(this.ariaDescribedBy() ?? this.root.ariaDescribedBy(), this.root.field)
    );

    protected readonly nativeStep = computed(() => {
        const value = this.thumb.value();
        const step = this.root.step();
        // An externally supplied value can be off the step grid. Keep it in the native input and FormData.
        return value === undefined || roundValueToStep(value, step, this.root.min()) === value ? step : 'any';
    });

    protected readonly valueText = computed(
        () =>
            this.ariaValueTextInput() ??
            getDefaultAriaValueText(this.root.values(), this.thumb.index(), this.root.format(), this.root.locale())
    );

    constructor() {
        // Host element exists in the constructor; the id may be user-provided and can update.
        effect(() => this.thumb.setInputElement(this.element, this.id()));
        afterRenderEffect({
            write: () => {
                // The browser sanitizes range values against the current bounds.
                this.root.min();
                this.root.max();
                this.nativeStep();
                this.syncNativeValue();
            }
        });

        inject(DestroyRef).onDestroy(() => {
            this.thumb.clearInputElement(this.element);
        });
    }

    protected onChange(event: Event): void {
        const value = (event.target as HTMLInputElement).valueAsNumber;
        if (!Number.isNaN(value) && value !== this.thumb.value()) {
            this.root.handleInputChange(value, this.thumb.index(), 'input-change', event);
        }
        this.syncNativeValue();
    }

    private syncNativeValue(): void {
        const value = this.thumb.value();
        if (value !== undefined && this.element.valueAsNumber !== value) {
            this.element.value = String(value);
        }
    }

    protected onFocus(): void {
        this.root.onThumbFocus(this.thumb.index());
    }

    protected onBlur(): void {
        this.root.setActive(-1);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.defaultPrevented || !ALL_KEYS.has(event.key)) {
            return;
        }
        if (COMPOSITE_KEYS.has(event.key)) {
            event.stopPropagation();
        }

        const min = this.root.min();
        const max = this.root.max();
        const step = this.root.step();
        const largeStep = this.root.largeStep();
        const rtl = this.root.dir() === 'rtl';
        const range = this.root.range();
        const values = this.root.values();
        const index = this.thumb.index();
        const thumbValue = values[index];
        const rounded = roundValueToStep(thumbValue, step, min);

        let newValue: number | null = null;
        switch (event.key) {
            case 'ArrowUp':
                newValue = getNewValue(rounded, event.shiftKey ? largeStep : step, 1, min, max);
                break;
            case 'ArrowRight':
                newValue = getNewValue(rounded, event.shiftKey ? largeStep : step, rtl ? -1 : 1, min, max);
                break;
            case 'ArrowDown':
                newValue = getNewValue(rounded, event.shiftKey ? largeStep : step, -1, min, max);
                break;
            case 'ArrowLeft':
                newValue = getNewValue(rounded, event.shiftKey ? largeStep : step, rtl ? 1 : -1, min, max);
                break;
            case 'PageUp':
                newValue = getNewValue(rounded, largeStep, 1, min, max);
                break;
            case 'PageDown':
                newValue = getNewValue(rounded, largeStep, -1, min, max);
                break;
            case 'End':
                newValue =
                    range && Number.isFinite(values[index + 1])
                        ? values[index + 1] - step * this.root.minStepsBetweenValues()
                        : max;
                break;
            case 'Home':
                newValue =
                    range && Number.isFinite(values[index - 1])
                        ? values[index - 1] + step * this.root.minStepsBetweenValues()
                        : min;
                break;
            default:
                break;
        }

        if (newValue !== null) {
            this.root.handleInputChange(newValue, index, 'keyboard', event);
            event.preventDefault();
        }
    }
}
