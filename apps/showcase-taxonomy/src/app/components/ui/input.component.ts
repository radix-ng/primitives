import { computed, Directive, input } from '@angular/core';

import { twMerge } from '@taxonomy/components/utils/twMerge';
import { cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';

const inputVariants = cva(
    'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
);

@Directive({
    selector: '[txInput]',
    standalone: true,
    host: {
        '[class]': '_computedClass()'
    }
})
export class TxInputDirective {
    protected readonly _computedClass = computed(() => twMerge(inputVariants(), this.userClass()));

    public readonly userClass = input<ClassValue>('', { alias: 'class' });
}
