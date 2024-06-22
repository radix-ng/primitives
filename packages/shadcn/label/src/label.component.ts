import { computed, Directive, input } from '@angular/core';

import { RdxLabelRootDirective } from '@radix-ng/primitives/label';
import { twMerge } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';

const variants = cva(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

@Directive({
    selector: '[shLabel]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxLabelRootDirective,
            inputs: ['htmlFor']
        }
    ],
    host: {
        '[class]': 'computedClass()'
    }
})
export class LabelDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => twMerge(variants(), this.userClass()));
}
