import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, Routes } from '@angular/router';

import {
    NgDocCustomSidebarDirective,
    NgDocNavbarComponent,
    NgDocRootComponent,
    NgDocSidebarComponent,
    NgDocThemeToggleComponent
} from '@ng-doc/app';
import { NG_DOC_ROUTING } from '@ng-doc/generated';
import {
    NgDocButtonIconComponent,
    NgDocIconComponent,
    NgDocTooltipDirective
} from '@ng-doc/ui-kit';
import { ShButtonDirective } from '@radix-ng/shadcn/button';

import { CustomSidebarComponent } from '../ui/custom-sidebar.component';
import { ThemeSwitcherComponent } from '../ui/theme-switcher/theme-switcher.component';

@Component({
    standalone: true,
    selector: 'app-root',
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet,

        NgDocRootComponent,
        NgDocNavbarComponent,
        NgDocSidebarComponent,
        NgDocButtonIconComponent,
        NgDocTooltipDirective,
        NgDocThemeToggleComponent,
        NgDocIconComponent,

        ThemeSwitcherComponent,
        ShButtonDirective,
        CustomSidebarComponent,
        NgDocCustomSidebarDirective
    ],
    templateUrl: './docs.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponent {
    private readonly router = inject(Router);

    protected readonly routes: {
        path: string;
        exact?: boolean;
        external?: boolean;
        label: string;
    }[] = [
        { path: '/docs/getting-started/installation', exact: true, label: 'Docs' },
        { path: '/docs/components/accordion', exact: true, label: 'Components' },
        { path: 'https://blocks.shadcn-ng.com/', external: true, label: 'Blocks' },
        { path: '/themes', exact: true, label: 'Themes' }
    ];

    isActive(route: { path: string; exact?: boolean; label: string; external?: boolean }): boolean {
        if (route.external) {
            return false;
        }
        return this.router.url === route.path;
    }

    getRouteClasses(route: any): string {
        const baseClasses = this.isActive(route) ? 'text-foreground' : 'text-foreground/60';
        const additionalClasses =
            route.path === '/docs/getting-started/installation' ? ' hidden md:block' : '';
        return baseClasses + additionalClasses;
    }
}

const routes: Routes = [
    { path: '', redirectTo: 'getting-started/installation', pathMatch: 'full' },
    {
        path: '',
        component: DocsComponent,
        children: NG_DOC_ROUTING
    }
];

export default routes;
