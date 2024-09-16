import { Component } from '@angular/core';
import { ShBreadcrumbModule } from '@radix-ng/shadcn/breadcrumb';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    standalone: true,
    imports: [ShBreadcrumbModule, LucideAngularModule],
    template: `
        <nav shBreadcrumb>
            <ol shBreadcrumbList>
                <li shBreadcrumbItem>
                    <a shBreadcrumbLink href="/">Home</a>
                </li>
                <li shBreadcrumbSeparator>
                    <lucide-angular class="flex h-3.5" name="Slash" size="16" />
                </li>
                <li shBreadcrumbItem>
                    <a shBreadcrumbLink href="/">Components</a>
                </li>
                <li shBreadcrumbSeparator>
                    <lucide-angular class="flex h-3.5" name="Slash" size="16" />
                </li>
                <li shBreadcrumbItem>
                    <a shBreadcrumbLink href="/">Breadcrumb</a>
                </li>
            </ol>
        </nav>
    `
})
export class BreadcrumbCustomSeparatorExampleComponent {}
