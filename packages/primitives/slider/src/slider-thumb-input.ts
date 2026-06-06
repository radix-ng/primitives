import { computed, Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';
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
        '[style.writing-mode]': 'writingMode()',
        '[attr.min]': 'root.min()',
        '[attr.max]': 'root.max()',
        '[attr.step]': 'root.step()',
        '[value]': 'thumb.value() ?? ""',
        '[disabled]': 'thumb.disabled()',
        '[attr.name]': 'root.name()',
        '[attr.form]': 'root.form()',
        '[attr.aria-orientation]': 'root.orientation()',
        '[attr.aria-valuenow]': 'thumb.value()',
        '[attr.aria-valuetext]': 'valueText()',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-labelledby]': 'ariaLabelledBy()',
        '[attr.data-index]': 'thumb.index()',
        '(keydown)': 'onKeyDown($event)',
        '(change)': 'onChange($event)',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    }
})
export class RdxSliderThumbInput implements OnInit, OnDestroy {
    protected readonly root = injectSliderRootContext()!;
    protected readonly thumb = inject(RdxSliderThumb);
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
    readonly ariaValueTextInput = input<string | undefined>(undefined, { alias: 'aria-valuetext' });

    protected readonly writingMode = computed(() =>
        this.root.orientation() === 'vertical' ? (this.root.dir() === 'rtl' ? 'vertical-rl' : 'vertical-lr') : undefined
    );

    protected readonly ariaLabelledBy = computed(() =>
        this.ariaLabel() == null ? this.root.ariaLabelledBy() : undefined
    );

    protected readonly valueText = computed(
        () =>
            this.ariaValueTextInput() ??
            getDefaultAriaValueText(this.root.values(), this.thumb.index(), this.root.format(), this.root.locale())
    );

    ngOnInit(): void {
        this.thumb.inputElement = this.element;
    }

    ngOnDestroy(): void {
        if (this.thumb.inputElement === this.element) {
            this.thumb.inputElement = null;
        }
    }

    protected onChange(event: Event): void {
        const value = (event.target as HTMLInputElement).valueAsNumber;
        if (!Number.isNaN(value)) {
            this.root.handleInputChange(value, this.thumb.index(), 'input');
        }
    }

    protected onFocus(): void {
        this.root.setActive(this.thumb.index());
    }

    protected onBlur(): void {
        this.root.setActive(-1);
        this.root.markAsTouched();
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
            this.root.handleInputChange(newValue, index, 'keyboard');
            event.preventDefault();
        }
    }
}
