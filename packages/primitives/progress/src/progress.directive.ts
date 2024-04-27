import { Directive, Input, numberAttribute } from '@angular/core';

import { RdxProgressToken } from './progress.token';

let idIterator = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

export type ProgressMode = 'indeterminate' | 'loading' | 'complete';

@Directive({
    selector: '[rdxProgress]',
    standalone: true,
    providers: [{ provide: RdxProgressToken, useExisting: RdxProgressDirective }],
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
export class RdxProgressDirective {
    @Input() id = `rdx-progress-bar-${idIterator++}`;
    /**
     * Define the progress value.
     */
    @Input({ alias: 'rdxProgressValue', transform: numberAttribute }) value = MIN_PERCENT;

    /**
     * Define the progress max value.
     * @default 100
     */
    @Input({ alias: 'rdxProgressMax', transform: numberAttribute }) max = MAX_PERCENT;

    /**
     * Define a function that returns the progress value label.
     */
    @Input('rdxProgressValueLabel') valueLabel: (value: number, max: number) => string = (
        value,
        max
    ) => `${Math.round((value / max) * 100)}%`;

    /**
     * Get the state of the progress bar.
     * @returns 'indeterminate' | 'loading' | 'complete'
     * @internal
     */
    get state(): ProgressMode {
        return this.value == null
            ? 'indeterminate'
            : this.value === this.max
              ? 'complete'
              : 'loading';
    }
}
