import { Component, computed, input, Input } from '@angular/core';
import { ResponsiveSize } from '@radix-ng/components/types';
import classNames from 'classnames';

@Component({
    selector: 'rdx-kbq',
    standalone: true,
    template: `
        <ng-content></ng-content>
    `,
    host: {
        '[class]': 'computedClass()'
    }
})
export class RdxKbqComponent {
    @Input() size?: ResponsiveSize;

    readonly class = input<string>();

    protected computedClass = computed(() =>
        classNames('rt-reset', 'rt-Kbd', this.size && `rt-r-size-${this.size}`, this.class())
    );
}
