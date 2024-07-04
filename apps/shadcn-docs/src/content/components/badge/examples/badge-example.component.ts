import { Component } from '@angular/core';

import { ShBadgeDirective } from '@radix-ng/shadcn/badge';

@Component({
    standalone: true,
    imports: [ShBadgeDirective],
    templateUrl: './badge-example.component.html'
})
export class BadgeExampleComponent {}
