import { Injectable, signal, WritableSignal } from '@angular/core';

interface ThemeContextValue {
    appearance: string;
    accentColor: string;
    grayColor: string;
    panelBackground: string;
    radius: string;
    scaling: string;
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private context = signal<ThemeContextValue>({
        appearance: 'default',
        accentColor: 'default',
        grayColor: 'default',
        panelBackground: 'default',
        radius: 'default',
        scaling: 'default'
    });

    get contextSignal(): WritableSignal<ThemeContextValue> {
        return this.context;
    }

    setAppearance(appearance: string) {
        this.context.update((current) => ({ ...current, appearance }));
    }

    setAccentColor(accentColor: string) {
        this.context.update((current) => ({ ...current, accentColor }));
    }

    setGrayColor(grayColor: string) {
        this.context.update((current) => ({ ...current, grayColor }));
    }

    setPanelBackground(panelBackground: string) {
        this.context.update((current) => ({ ...current, panelBackground }));
    }

    setRadius(radius: string) {
        this.context.update((current) => ({ ...current, radius }));
    }

    setScaling(scaling: string) {
        this.context.update((current) => ({ ...current, scaling }));
    }
}
