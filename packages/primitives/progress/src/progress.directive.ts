import { Directive, Input, numberAttribute } from '@angular/core';

import { RdxProgressToken } from './progress.token';

@Directive({
    selector: '[rdxProgress]',
    standalone: true,
    providers: [{ provide: RdxProgressToken, useExisting: RdxProgressDirective }],
    host: {
        role: 'progressbar',
        '[attr.aria-valuemax]': 'max',
        '[attr.aria-valuemin]': '0',
        '[attr.aria-valuenow]': 'value',
        '[attr.aria-valuetext]': 'valueLabel(value, max)',
        '[attr.data-state]': 'state',
        '[attr.data-value]': 'value',
        '[attr.data-max]': 'max'
    }
})
export class RdxProgressDirective {
    /**
     * Define the progress value.
     */
    @Input({ alias: 'rdxProgressValue', transform: numberAttribute }) value = 0;

    /**
     * Define the progress max value.
     * @default 100
     */
    @Input({ alias: 'rdxProgressMax', transform: numberAttribute }) max = 100;

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
    get state(): 'indeterminate' | 'loading' | 'complete' {
        return this.value == null
            ? 'indeterminate'
            : this.value === this.max
              ? 'complete'
              : 'loading';
    }
}
