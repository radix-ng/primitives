import { Component } from '@angular/core';
import { badgeVariants } from '@radix-ng/shadcn/badge';

@Component({
    standalone: true,
    template: `
        <a [class]="variants({ variant: 'outline' })">Secondary</a>
    `
})
export class BadgeExampleLinkComponent {
    variants = badgeVariants;
}
