import { Component } from '@angular/core';

import { ShBadgeDirective } from '@radix-ng/shadcn/badge';

@Component({
    standalone: true,
    imports: [ShBadgeDirective],
    template: `
        <div shBadge variant="destructive">Destructive</div>
    `
})
export class BadgeExampleDestructiveComponent {}
