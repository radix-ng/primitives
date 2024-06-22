// This code is an adaptation of code from https://ui.shadcn.com/docs.

import { computed, Directive, input } from '@angular/core';

import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';

const variants = cva(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
);

@Directive({
    selector: '[shInput]',
    standalone: true,
    host: {
        '[class]': 'computedClass()',
        '[type]': 'type()'
    }
})
export class ShInputDirective {
    readonly type = input<string>('text');
    readonly userClass = input<ClassValue>('', { alias: 'class' });

    protected computedClass = computed(() => cn(variants(), this.userClass()));
}
