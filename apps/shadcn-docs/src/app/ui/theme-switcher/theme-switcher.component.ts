import { Component, inject } from '@angular/core';

import { NgDocIconComponent } from '@ng-doc/ui-kit';
import { ShButtonDirective } from '@radix-ng/shadcn/button';

import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-doc-theme-toggle',
    standalone: true,
    imports: [NgDocIconComponent, ShButtonDirective],
    template: `
        <button
            shButton
            type="button"
            variant="ghost"
            size="icon"
            (click)="themeService.toggleTheme()"
        >
            @if (themeService.theme === 'light') {
                <ng-doc-icon icon="sun" [size]="24"></ng-doc-icon>
            } @else {
                <ng-doc-icon icon="moon" [size]="24"></ng-doc-icon>
            }
        </button>
    `,
    styles: `
        :host {
            @apply flex items-center;
        }
    `
})
export class ThemeSwitcherComponent {
    themeService = inject(ThemeService);
}
