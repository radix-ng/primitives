import { Component } from '@angular/core';

import { ShBreadcrumbModule } from '@radix-ng/shadcn/breadcrumb';

@Component({
    standalone: true,
    imports: [ShBreadcrumbModule],
    template: `
        <nav shBreadcrumb>
            <ol shBreadcrumbList>
                <li shBreadcrumbItem>
                    <a shBreadcrumbLink href="/">Home</a>
                </li>
                <li shBreadcrumbSeparator></li>
                <li shBreadcrumbItem>
                    <a shBreadcrumbLink href="/">Components</a>
                </li>
                <li shBreadcrumbSeparator></li>
                <li shBreadcrumbItem>
                    <a shBreadcrumbLink href="/">Breadcrumb</a>
                </li>
            </ol>
        </nav>
    `
})
export class BreadcrumbExampleComponent {}
