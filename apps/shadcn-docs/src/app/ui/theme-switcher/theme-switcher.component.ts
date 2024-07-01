import { Component, inject } from '@angular/core';

import { NgDocIconComponent } from '@ng-doc/ui-kit';

import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-doc-theme-toggle',
    standalone: true,
    imports: [NgDocIconComponent],
    template: `
        <button type="button" class="border-0" (click)="themeService.toggleTheme()">
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
