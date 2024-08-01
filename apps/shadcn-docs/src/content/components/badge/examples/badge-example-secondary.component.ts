import { Component } from '@angular/core';
import { ShBadgeDirective } from '@radix-ng/shadcn/badge';

@Component({
    standalone: true,
    imports: [ShBadgeDirective],
    template: `
        <div
            shBadge
            variant="secondary"
        >
            Secondary
        </div>
    `
})
export class BadgeExampleSecondaryComponent {}
