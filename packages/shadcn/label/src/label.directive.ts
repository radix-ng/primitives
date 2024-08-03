// This code is an adaptation of code from https://ui.shadcn.com/docs.

import { computed, Directive, input } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';

const variants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');

@Directive({
    selector: '[shLabel]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxLabelDirective,
            inputs: ['htmlFor']
        }
    ],
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShLabelDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => cn(variants(), this.userClass()));
}
