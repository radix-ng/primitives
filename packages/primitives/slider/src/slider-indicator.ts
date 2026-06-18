import { computed, Directive } from '@angular/core';
import { injectSliderRootContext } from './slider-context';
import { valueToPercent } from './slider.utils';

function getInsetStyles(
    vertical: boolean,
    range: boolean,
    start: number | undefined,
    end: number | undefined
): Record<string, string | number> {
    const startEdge = vertical ? 'bottom' : 'inset-inline-start';
    const mainSide = vertical ? 'height' : 'width';
    const crossSide = vertical ? 'width' : 'height';

    const styles: Record<string, string | number> = {
        position: vertical ? 'absolute' : 'relative',
        [crossSide]: 'inherit'
    };

    if (start === undefined || (range && end === undefined)) {
        styles['visibility'] = 'hidden';
    }

    if (!range) {
        styles[startEdge] = 0;
        styles[mainSide] = `${start ?? 0}%`;
        return styles;
    }

    styles[startEdge] = `${start ?? 0}%`;
    styles[mainSide] = `${(end ?? 0) - (start ?? 0)}%`;
    return styles;
}

/**
 * Visualises the portion of the track between the slider's minimum (or the first
 * thumb in a range) and the active value.
 *
 * @see https://base-ui.com/react/components/slider
 */
@Directive({
    selector: 'div[rdxSliderIndicator]',
    exportAs: 'rdxSliderIndicator',
    host: {
        '[style]': 'indicatorStyle()',
        '[attr.data-orientation]': 'root.orientation()',
        '[attr.data-disabled]': 'root.isDisabled() ? "" : undefined',
        '[attr.data-dragging]': 'root.dragging() ? "" : undefined'
    }
})
export class RdxSliderIndicator {
    protected readonly root = injectSliderRootContext();

    protected readonly indicatorStyle = computed<Record<string, string | number>>(() => {
        const vertical = this.root.orientation() === 'vertical';
        const range = this.root.range();
        const values = this.root.values();
        const min = this.root.min();
        const max = this.root.max();
        const inset = this.root.inset();

        const startEdge = vertical ? 'bottom' : 'inset-inline-start';
        const mainSide = vertical ? 'height' : 'width';
        const crossSide = vertical ? 'width' : 'height';

        const start = valueToPercent(values[0], min, max);
        const end = valueToPercent(values[values.length - 1], min, max);

        if (inset) {
            const [startPosition, endPosition] = this.root.indicatorPosition();
            return getInsetStyles(vertical, range, startPosition, endPosition);
        }

        const styles: Record<string, string | number> = {
            position: vertical ? 'absolute' : 'relative',
            [crossSide]: 'inherit'
        };

        if (!range) {
            styles[startEdge] = 0;
            styles[mainSide] = `${start}%`;
            return styles;
        }

        styles[startEdge] = `${start}%`;
        styles[mainSide] = `${end - start}%`;
        return styles;
    });
}
