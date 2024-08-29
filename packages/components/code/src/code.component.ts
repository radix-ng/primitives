import { Component, computed, input, Input } from '@angular/core';
import classNames from 'classnames';

type ResponsiveSize = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

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
    @Input() color?:
        | 'gray'
        | 'gold'
        | 'bronze'
        | 'brown'
        | 'yellow'
        | 'amber'
        | 'orange'
        | 'tomato'
        | 'red'
        | 'ruby'
        | 'crimson'
        | 'pink'
        | 'plum'
        | 'purple'
        | 'violet'
        | 'iris'
        | 'indigo'
        | 'blue'
        | 'cyan'
        | 'teal'
        | 'jade'
        | 'green'
        | 'grass'
        | 'lime'
        | 'mint';

    readonly class = input<string>();

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
