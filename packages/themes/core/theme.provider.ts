import { inject, InjectionToken, Provider } from '@angular/core';

export const THEME_CONFIG_TOKEN = new InjectionToken<ThemeConfigType>('THEME_CONFIG_TOKEN');

export type ThemeConfigType = {
    useLocalStorage: boolean;
    nameLocalStorageKey: string;
    // default Body
    elementId?: string;
};

export const THEME_CONFIG: ThemeConfigType = {
    useLocalStorage: true,
    nameLocalStorageKey: 'data-theme'
};

export function provideThemeConfig(config: Partial<ThemeConfigType>): Provider[] {
    return [
        {
            provide: THEME_CONFIG_TOKEN,
            useValue: { ...THEME_CONFIG, ...config }
        }
    ];
}

export function injectThemeConfig(): ThemeConfigType {
    return inject(THEME_CONFIG_TOKEN, { optional: true }) ?? THEME_CONFIG;
}
