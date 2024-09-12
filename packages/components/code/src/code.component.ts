import { Component, computed, input, Input } from '@angular/core';
import { RadixColor, ResponsiveSize } from '@radix-ng/components/types';
import classNames from 'classnames';

@Component({
    selector: 'rdx-code',
    standalone: true,
    template: `
        <ng-content></ng-content>
    `,
    host: {
        '[class]': 'computedClass()',
        '[attr.data-accent-color]': 'getDataAccentColor()'
    }
})
export class RdxCodeComponent {
    @Input() size?: ResponsiveSize;
    @Input() variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'surface' = 'soft';
    @Input() weight?: 'light' | 'regular' | 'medium' | 'bold';
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
