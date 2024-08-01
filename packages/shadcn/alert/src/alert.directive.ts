import { computed, Directive, input } from '@angular/core';
import { cn } from '@radix-ng/shadcn/core';
import { cva, VariantProps } from 'class-variance-authority';

const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

type AlertProps = VariantProps<typeof alertVariants>;
export type ShAlertVariant = NonNullable<AlertProps['variant']>;

@Directive({
    selector: 'div[shAlert]',
    standalone: true,
    host: {
        role: 'alert',
        '[class]': 'computedClass()'
    }
})
export class ShAlertDirective {
    readonly class = input<string>();
    readonly variant = input<ShAlertVariant>('default');

    protected computedClass = computed(() => cn(alertVariants({ variant: this.variant(), class: this.class() })));
}

const alertTitleVariants = cva('mb-1 font-medium leading-none tracking-tight');
@Directive({
    selector: 'h5[shAlertTitle]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShAlertTitleDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(alertTitleVariants({ class: this.class() })));
}

const alertDescriptionVariants = cva('text-sm [&_p]:leading-relaxed');
@Directive({
    selector: 'div[shAlertDescription]',
    standalone: true,
    host: {
        '[class]': 'computedClass()'
    }
})
export class ShAlertDescriptionDirective {
    readonly class = input<string>();

    protected computedClass = computed(() => cn(alertDescriptionVariants({ class: this.class() })));
}
