import { Component } from '@angular/core';

import { ShBreadcrumbModule } from '@radix-ng/shadcn/breadcrumb';

@Component({
    standalone: true,
    imports: [ShBreadcrumbModule],
    templateUrl: './breadcrumb-example.component.html'
})
export class BreadcrumbExampleComponent {}
