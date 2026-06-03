import { injectSliderRootContext } from './slider-context';
import { computed, Directive, input } from '@angular/core';

/**
 * Displays the slider's current value(s) as formatted text. Renders into an
 * `output` element; the displayed value honours the root `format` and `locale`.
 *
 * @see https://base-ui.com/react/components/slider
 */
@Directive({
    selector: 'output[rdxSliderValue]',
    exportAs: 'rdxSliderValue',
    host: {
        'aria-live': 'off',
        '[attr.for]': 'forAttr()',
        '[textContent]': 'display()'
    }
})
export class RdxSliderValue {
    protected readonly root = injectSliderRootContext();

    /** The separator placed between values of a range slider. */
    readonly separator = input<string>(' – ');

    protected readonly forAttr = computed(() => {
        const inputIds = this.root.thumbInputIds();
        return inputIds.length > 0 ? inputIds.join(' ') : undefined;
    });

    protected readonly display = computed(() =>
        this.root
            .values()
            .map((value) => this.root.formatValue(value) || `${value}`)
            .join(this.separator())
    );
}
