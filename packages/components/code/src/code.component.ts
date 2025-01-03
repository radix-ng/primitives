import { Component, computed, input, Input, numberAttribute } from '@angular/core';
import { RadixColor, ResponsiveSize } from '@radix-ng/components/types';
import classNames from 'classnames';

/**
 * @group Components
 */
@Component({
    selector: 'rdx-code',
    standalone: true,
    template: `
        <ng-content />
    `,
    host: {
        '[class]': 'computedClass()',
        '[attr.data-accent-color]': 'getDataAccentColor()'
    }
})
export class RdxCodeComponent {
    /**
     * @group Props
     */
    @Input({ transform: numberAttribute }) size?: ResponsiveSize;
    /**
     * @group Props
     */
    @Input() variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'surface' = 'soft';
    /**
     * @group Props
     */
    @Input() weight?: 'light' | 'regular' | 'medium' | 'bold';
    /**
     * @group Props
     */
    @Input() color?: RadixColor;

    readonly class = input<string>();

    /**
     * @ignore
     */
    protected computedClass = computed(() =>
        classNames(
            'rt-reset',
            'rt-Code',
            this.size && `rt-r-size-${this.size}`,
            this.variant && `rt-variant-${this.variant}`,
            this.color && `rt-color-${this.color}`,
            this.weight && `rt-r-weight-${this.weight}`,
            this.class()
        )
    );

    protected getDataAccentColor() {
        return this.color || undefined;
    }
}
