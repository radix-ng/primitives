import { inject, Injectable } from '@angular/core';
import { NgDocThemeService } from '@ng-doc/app/services/theme';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly config = inject(ConfigService);

    colorScheme = localStorage.getItem('color-scheme') || 'dark';

    constructor(protected readonly themeService: NgDocThemeService) {
        document.querySelector('body')?.classList.toggle('dark', this.colorScheme === 'dark');
    }

    toggleColorScheme() {
        this.colorScheme = this.colorScheme === 'light' ? 'dark' : 'light';
        document.querySelector('body')?.classList.toggle('dark', this.colorScheme === 'dark');

        this.themeService.set(this.colorScheme);
        localStorage.setItem('color-scheme', this.colorScheme);
    }

    updateTheme(config?: any) {
        const themeWrapper = document.querySelector('app-root') as HTMLElement;

        themeWrapper?.classList.forEach((className) => {
            if (className.match(/^theme.*/)) {
                themeWrapper?.classList.remove(className);
            }
        });

        const themeName = config ? config.theme : this.config.getConfig().theme;
        if (themeName) {
            themeWrapper?.classList.add(`theme-${themeName}`);
        }

        const radius = config ? config.radius : this.config.getConfig().radius;
        if (radius !== undefined) {
            themeWrapper?.style.setProperty('--radius', `${radius}rem`);
        }
    }
}
