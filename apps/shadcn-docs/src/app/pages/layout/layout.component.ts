import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgDocNavbarComponent, NgDocRootComponent } from '@ng-doc/app';
import { NgDocIconComponent, NgDocTooltipDirective } from '@ng-doc/ui-kit';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import { ThemeSwitcherComponent } from '../../ui/theme-switcher/theme-switcher.component';

@Component({
    selector: 'app-layout',
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
        NgDocRootComponent,
        NgDocNavbarComponent,
        NgDocTooltipDirective,
        NgDocIconComponent,
        ThemeSwitcherComponent,
        ShButtonDirective
    ],
    templateUrl: './layout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
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
        const additionalClasses = route.path === '/docs/getting-started/installation' ? ' hidden md:block' : '';
        return baseClasses + additionalClasses;
    }
}
