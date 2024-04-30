import { Directive, inject, InjectionToken, Input, numberAttribute } from '@angular/core';

let idIterator = 0;

const MIN_PERCENT = 0;
const DEFAULT_MAX = 100;

const RdxProgressToken = new InjectionToken<RdxProgressRootDirective>('RdxProgressDirective');

export function injectProgress(): RdxProgressRootDirective {
    return inject(RdxProgressToken);
}

export type ProgressState = 'indeterminate' | 'loading' | 'complete';

export interface ProgressProps {
    value?: number | null | undefined;
    max?: number;
    getValueLabel?: string;
}

@Directive({
    selector: 'div[ProgressRoot]',
    exportAs: 'ProgressRoot',
    standalone: true,
    providers: [{ provide: RdxProgressToken, useExisting: RdxProgressRootDirective }],
    host: {
        role: 'progressbar',
        '[attr.id]': 'id',
        '[attr.aria-valuemax]': 'max',
        '[attr.aria-valuemin]': '0',
        '[attr.aria-valuenow]': 'value',
        '[attr.aria-valuetext]': 'valueLabel(value, max)',
        '[attr.data-state]': 'state',
        '[attr.data-value]': 'value',
        '[attr.data-max]': 'max',
        // set tab index to -1 so screen readers will read the aria-label
        // Note: there is a known issue with JAWS that does not read progressbar aria labels on FireFox
        tabindex: '-1'
    }
})
export class RdxProgressRootDirective implements ProgressProps {
    @Input() id = `rdx-progress-bar-${idIterator++}`;

    @Input({ alias: 'rdxValue', transform: numberAttribute }) value = MIN_PERCENT;

    /**
     * @default 100
     */
    @Input({ alias: 'rdxMax', transform: numberAttribute }) max = DEFAULT_MAX;

    @Input('rdxValueLabel') valueLabel: (value: number, max: number) => string = (value, max) =>
        this.defaultGetValueLabel(value, max);

    /**
     * Get the state of the progress bar.
     * @returns 'indeterminate' | 'loading' | 'complete'
     * @internal
     */
    get state(): ProgressState {
        return this.getProgressState(this.value, this.max);
    }

    private getProgressState(value: number | undefined | null, maxValue: number): ProgressState {
        return value == null ? 'indeterminate' : value === maxValue ? 'complete' : 'loading';
    }

    private defaultGetValueLabel(value: number, max: number) {
        return `${Math.round((value / max) * 100)}%`;
    }
}
