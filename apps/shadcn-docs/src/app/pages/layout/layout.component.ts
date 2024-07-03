import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import {
    NgDocNavbarComponent,
    NgDocRootComponent,
    NgDocSidebarComponent,
    NgDocThemeToggleComponent
} from '@ng-doc/app';
import {
    NgDocButtonIconComponent,
    NgDocIconComponent,
    NgDocTooltipDirective
} from '@ng-doc/ui-kit';
import { ShButtonDirective } from '@radix-ng/shadcn/button';

import { ThemeSwitcherComponent } from '../../ui/theme-switcher/theme-switcher.component';

@Component({
    selector: 'app-layout',
    standalone: true,
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
        ShButtonDirective
    ],
    templateUrl: './layout.component.html'
})
export class LayoutComponent {
    protected readonly routes: { path: string; exact?: boolean; label: string }[] = [
        { path: '/docs', exact: true, label: 'Docs' },
        { path: '/blocks', label: 'Blocks' }
    ];
}
