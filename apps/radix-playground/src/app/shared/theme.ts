import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
    private readonly document = inject(DOCUMENT);

    readonly theme = signal<Theme>(
        this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    constructor() {
        effect(() => {
            this.document.documentElement.dataset['theme'] = this.theme();
        });
    }

    toggle(): void {
        this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
    }
}
