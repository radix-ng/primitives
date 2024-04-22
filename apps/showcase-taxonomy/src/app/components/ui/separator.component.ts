import { computed, Directive, Input, input } from '@angular/core';

import { RdxSeparatorDirective } from '@radix-ng/primitives/separator';
import { twMerge } from '@taxonomy/components/utils/twMerge';
import { ClassValue } from 'clsx';

@Directive({
    selector: '[txSeparator]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxSeparatorDirective,
            inputs: ['rdxSeparatorOrientation: txOrientation', 'rdxSeparatorDecorative']
        }
    ],
    host: {
        '[class]': '_computedClass()'
    }
})
export class TxSeparatorDirective {
    @Input('txOrientation') orientation = 'horizontal';

    public readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected readonly _computedClass = () =>
        computed(() =>
            twMerge(
                'shrink-0 bg-border',
                `${this.orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'}`,
                this.userClass()
            )
        );
}
