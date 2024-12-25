import { Component, inject } from '@angular/core';
import { NgDocIconComponent } from '@ng-doc/ui-kit';
import { ShButtonDirective } from '@radix-ng/shadcn/button';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-doc-theme-toggle',
    imports: [NgDocIconComponent, ShButtonDirective],
    template: `
        <button (click)="themeService.toggleColorScheme()" shButton type="button" variant="ghost" size="icon">
            @if (themeService.colorScheme === 'light') {
                <ng-doc-icon customIcon="moon" />
            } @else {
                <ng-doc-icon customIcon="sun" />
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
