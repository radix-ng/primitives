import { computed, Directive, input } from '@angular/core';

import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';

const variants = cva('animate-pulse rounded-md bg-muted');

@Directive({
    selector: '[shSkeleton]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShSkeletonDirective {
    readonly class = input<string>();
    protected computedClass = computed(() => cn(variants(), this.class()));
}
