import { Component } from '@angular/core';

import { ShBadgeDirective } from '@radix-ng/shadcn/badge';

@Component({
    standalone: true,
    imports: [ShBadgeDirective],
    templateUrl: './badge-example-destructive.component.html',
    styles: `
        :host {
            @apply flex min-h-[350px] w-full items-center justify-center p-10;
        }
    `
})
export class BadgeExampleDestructiveComponent {}
