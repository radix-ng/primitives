import { Component } from '@angular/core';
import { ShBadgeDirective } from '@radix-ng/shadcn/badge';

@Component({
    standalone: true,
    imports: [ShBadgeDirective],
    template: `
        <div shBadge>Badge</div>
    `
})
export class BadgeExampleComponent {}
