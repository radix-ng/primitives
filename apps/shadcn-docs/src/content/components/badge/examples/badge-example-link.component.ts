import { Component } from '@angular/core';
import { badgeVariants, ShBadgeDirective } from '@radix-ng/shadcn/badge';

@Component({
    standalone: true,
    imports: [ShBadgeDirective],
    template: `
        <a [class]="variants({ variant: 'outline' })">Secondary</a>
    `
})
export class BadgeExampleLinkComponent {
    variants = badgeVariants;
}
