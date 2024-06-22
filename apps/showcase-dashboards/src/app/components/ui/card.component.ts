import { computed, Directive, input } from '@angular/core';

import { twMerge } from '@radix-ng/shadcn/core';
import { cva } from 'class-variance-authority';
import { ClassValue } from 'clsx';

@Directive({
    selector: '[Card]',
    standalone: true,
    host: {
        '[class]': "'bg-card text-card-foreground rounded-xl border shadow'"
    }
})
export class CardDirective {}

@Directive({
    selector: '[CardHeader]',
    standalone: true,
    host: {
        '[class]': "'flex flex-col space-y-1.5 p-6'"
    }
})
export class CardHeaderDirective {}

@Directive({
    selector: '[CardTitle]',
    standalone: true,
    host: {
        '[class]': "'font-semibold leading-none tracking-tight'"
    }
})
export class CardTitleDirective {}

@Directive({
    selector: '[CardDescription]',
    standalone: true,
    host: {
        '[class]': "'text-sm text-muted-foreground'"
    }
})
export class CardDescriptionDirective {}

@Directive({
    selector: '[CardContent]',
    standalone: true,
    host: {
        '[class]': "'p-6 pt-0'"
    }
})
export class CardContentDirective {}

const cardFooterVariants = cva('flex items-center p-6 pt-0');
@Directive({
    selector: '[CardFooter]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class CardFooterDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    protected computedClass = computed(() => twMerge(cardFooterVariants(), this.userClass()));
}
