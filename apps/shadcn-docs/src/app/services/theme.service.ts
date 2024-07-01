import { inject, Injectable } from '@angular/core';

import { NgDocThemeService } from '@ng-doc/app';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    ngDocTheme = inject(NgDocThemeService);

    theme = localStorage.getItem('theme') || 'dark';

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark', this.theme === 'dark');
        localStorage.setItem('theme', this.theme);
        this.ngDocTheme.set(this.theme, false);
    }

    constructor() {
        document.body.classList.toggle('dark', this.theme === 'dark');
        this.ngDocTheme.set(this.theme, false);
    }
}
