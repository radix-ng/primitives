import { computed, Directive, input } from '@angular/core';

import { cn } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';

@Directive({
    selector: '[shCard]',
    standalone: true,
    host: {
        '[class]': "'bg-card text-card-foreground rounded-xl border shadow'"
    }
})
export class ShCardDirective {}

const cardHeaderVariants = cva('flex flex-col space-y-1.5 p-6');
@Directive({
    selector: '[shCardHeader]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShCardHeaderDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(cardHeaderVariants({ class: this.class() })));
}

@Directive({
    selector: '[shCardTitle]',
    standalone: true,
    host: {
        '[class]': "'font-semibold leading-none tracking-tight'"
    }
})
export class ShCardTitleDirective {}

@Directive({
    selector: '[shCardDescription]',
    standalone: true,
    host: {
        '[class]': "'text-sm text-muted-foreground'"
    }
})
export class ShCardDescriptionDirective {}

@Directive({
    selector: '[shCardContent]',
    standalone: true,
    host: {
        '[class]': "'p-6 pt-0'"
    }
})
export class ShCardContentDirective {}

const cardFooterVariants = cva('flex items-center p-6 pt-0');
@Directive({
    selector: '[shCardFooter]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShCardFooterDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(cardFooterVariants({ class: this.class() })));
}
