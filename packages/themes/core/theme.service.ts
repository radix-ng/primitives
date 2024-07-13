import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, RendererFactory2, signal } from '@angular/core';

import { injectThemeConfig } from './theme.provider';

type ThemeType = 'dark' | 'light';

@Injectable()
export class ThemeService {
    private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
    private readonly documentRef = inject(DOCUMENT);
    private readonly themeConfig = injectThemeConfig();

    readonly theme = signal<ThemeType>('light');

    /**
     * Gets the element on which the data-theme attribute is applied.
     * Defaults to the document body.
     */
    private get themeElement(): HTMLElement {
        return this.themeConfig.elementId
            ? this.documentRef.getElementById(this.themeConfig.elementId)
            : this.documentRef.body;
    }

    constructor() {
        const savedTheme = this.themeConfig.useLocalStorage
            ? (this.localStorage?.getItem(this.themeConfig.nameLocalStorageKey) as ThemeType | null)
            : null;

        if (savedTheme) {
            this.theme.set(savedTheme);
        }

        effect(() => {
            this.theme() === 'dark' ? this.applyTheme('dark') : this.applyTheme('light');
        });
    }

    light() {
        this.applyTheme('light');
    }

    dark() {
        this.applyTheme('dark');
    }

    toggle() {
        this.theme() === 'dark' ? this.theme.set('light') : this.theme.set('dark');
    }

    private themeStorage() {
        if (this.themeConfig.useLocalStorage) {
            this.localStorage?.setItem(this.themeConfig.nameLocalStorageKey, this.theme());
        }
    }

    private applyTheme(theme: ThemeType) {
        this.renderer.setAttribute(this.themeElement, this.themeConfig.nameLocalStorageKey, theme);
        this.theme.set(theme);
        if (this.themeConfig.useLocalStorage) {
            this.themeStorage();
        }
    }

    private get localStorage() {
        return this.documentRef.defaultView?.localStorage;
    }
}
