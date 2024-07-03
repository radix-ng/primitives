import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Routes } from '@angular/router';

import {
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
        ShButtonDirective
    ],
    templateUrl: './docs.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsComponent {
    protected readonly routes: { path: string; exact?: boolean; label: string }[] = [
        { path: '/docs', exact: true, label: 'Docs' },
        { path: '/', label: 'Blocks' }
    ];
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
