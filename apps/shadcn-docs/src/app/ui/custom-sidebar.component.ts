import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { NG_DOC_CONTEXT } from '@ng-doc/app';

@Component({
    selector: 'app-custom-sidebar',
    standalone: true,
    imports: [RouterLinkActive, RouterLink],
    template: `
        <aside
            class="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block"
        >
            <div class="relative h-full overflow-hidden py-6 pr-6 lg:py-8">
                <div class="w-full">
                    @for (category of navigationItems; track category) {
                        <div class="pb-4">
                            <h4 class="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                                {{ category.title }}
                            </h4>
                            <div class="grid grid-flow-row auto-rows-max text-sm">
                                @for (item of category.children; track item) {
                                    <a
                                        [class]="getRouteClasses(item)"
                                        [routerLink]="[item?.route ?? '']"
                                        routerLinkActive="active"
                                    >
                                        {{ item.title }}
                                    </a>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        </aside>
    `
})
export class CustomSidebarComponent {
    protected readonly context = inject(NG_DOC_CONTEXT);
    private readonly router = inject(Router);

    protected navigationItems = this.context.navigation;

    isActive(item: { route: string }): boolean {
        return this.router.url === item.route;
    }

    getRouteClasses(item: any) {
        const baseClasses =
            'group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline';

        const activeClasses = this.isActive(item)
            ? 'font-medium text-foreground'
            : 'text-muted-foreground';

        return `${baseClasses} ${activeClasses}`;
    }
}
