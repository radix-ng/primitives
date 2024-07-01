import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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

import { ThemeSwitcherComponent } from './ui/theme-switcher/theme-switcher.component';

@Component({
    standalone: true,
    selector: 'app-root',
    imports: [
        NgDocRootComponent,
        RouterOutlet,
        NgDocNavbarComponent,
        NgDocSidebarComponent,
        NgDocButtonIconComponent,
        NgDocTooltipDirective,
        NgDocThemeToggleComponent,
        NgDocIconComponent,

        ThemeSwitcherComponent,
        ShButtonDirective
    ],
    template: `
        <ng-doc-root>
            <ng-doc-navbar
                class="bg-background sticky top-0 z-20"
                [leftContent]="leftContent"
                [rightContent]="rightContent"
            >
                <ng-template #leftContent>
                    <a class="mr-6 flex items-center space-x-2" href="/">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 256 256"
                            class="h-6 w-6"
                        >
                            <rect width="256" height="256" fill="none"></rect>
                            <line
                                x1="208"
                                y1="128"
                                x2="128"
                                y2="208"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="16"
                            ></line>
                            <line
                                x1="192"
                                y1="40"
                                x2="40"
                                y2="192"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="16"
                            ></line>
                        </svg>
                        <span class="hidden font-bold sm:inline-block">shadcn/ui</span>
                    </a>
                </ng-template>
                <ng-template #rightContent>
                    <div class="flex gap-4">
                        <app-doc-theme-toggle />
                        <a
                            shButton
                            href="https://github.com/radix-ng/primitives"
                            ngDocTooltip="Repository on GitHub"
                            variant="ghost"
                            size="icon"
                            target="_blank"
                        >
                            <ng-doc-icon [size]="24" customIcon="github"></ng-doc-icon>
                        </a>
                    </div>
                </ng-template>
            </ng-doc-navbar>
            <ng-doc-sidebar></ng-doc-sidebar>
            <router-outlet></router-outlet>
        </ng-doc-root>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
