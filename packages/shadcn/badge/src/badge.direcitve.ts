import { computed, Directive, input } from '@angular/core';

import { cn } from '@radix-ng/shadcn/core';
import { cva, VariantProps } from 'class-variance-authority';
import { ClassValue } from 'clsx';

export const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
                outline: 'text-foreground'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
    selector: '[shBadge]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShBadgeDirective {
    readonly userClass = input<ClassValue>('', { alias: 'class' });
    readonly variant = input<BadgeVariants['variant']>('default');

    protected computedClass = computed(() =>
        cn(badgeVariants({ variant: this.variant() }), this.userClass())
    );
}
