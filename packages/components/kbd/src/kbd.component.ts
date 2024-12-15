import { Component, computed, input, Input, InputSignal, numberAttribute } from '@angular/core';
import { ResponsiveSize } from '@radix-ng/components/types';
import classNames from 'classnames';

@Component({
    selector: 'rdx-kbd',
    standalone: true,
    template: `
        <ng-content />
    `,
    host: {
        '[class]': 'computedClass()'
    }
})
export class RdxKbdComponent {
    @Input({ transform: numberAttribute }) size?: ResponsiveSize;

    readonly class: InputSignal<string | undefined> = input<string | undefined>();

    /**
     *
     * @ignore
     */
    protected computedClass = computed(() =>
        classNames('rt-reset', 'rt-Kbd', this.size && `rt-r-size-${this.size}`, this.class())
    );
}
