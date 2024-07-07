import { inject, Injectable } from '@angular/core';

import { NgDocThemeService } from '@ng-doc/app';

import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly ngDocTheme = inject(NgDocThemeService);
    private readonly config = inject(ConfigService);

    colorScheme = localStorage.getItem('color-scheme') || 'dark';

    constructor() {
        document.querySelector('body')?.classList.toggle('dark', this.colorScheme === 'dark');

        this.ngDocTheme.set(this.colorScheme, false);
    }

    toggleColorScheme() {
        this.colorScheme = this.colorScheme === 'light' ? 'dark' : 'light';
        document.querySelector('body')?.classList.toggle('dark', this.colorScheme === 'dark');

        localStorage.setItem('color-scheme', this.colorScheme);
        this.ngDocTheme.set(this.colorScheme, false);
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
        if (radius) {
            themeWrapper?.style.setProperty('--radius', `${radius}rem`);
        }
    }
}
