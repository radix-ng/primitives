import { Component } from '@angular/core';

import { ShBreadcrumbModule } from '@radix-ng/shadcn/breadcrumb';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    standalone: true,
    imports: [ShBreadcrumbModule, LucideAngularModule],
    templateUrl: './breadcrumb-custom-separator-example.component.html'
})
export class BreadcrumbCustomSeparatorExampleComponent {}
