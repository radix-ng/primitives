import { computed, Injectable, InjectionToken, signal } from '@angular/core';

export const TABS_CONTEXT_TOKEN = new InjectionToken<RdxTabsContextService>('TabsContext');

@Injectable({
    providedIn: 'root'
})
export class RdxTabsContextService {
    private baseId = this.generateId();
    private value = signal<string | undefined>(undefined);
    private orientation = signal<string>('horizontal');
    private dir = signal<string | undefined>(undefined);
    private activationMode = signal<string>('automatic');

    readonly value$ = computed(() => this.value());
    readonly orientation$ = computed(() => this.orientation());
    readonly dir$ = computed(() => this.dir());
    readonly activationMode$ = computed(() => this.activationMode());

    setValue(value: string) {
        this.value.set(value);
    }

    setOrientation(orientation: string) {
        this.orientation.set(orientation);
    }

    setDir(dir: string) {
        this.dir.set(dir);
    }

    setActivationMode(mode: string) {
        this.activationMode.set(mode);
    }

    getBaseId() {
        return this.baseId;
    }

    private generateId() {
        return `tabs-${Math.random().toString(36).substr(2, 9)}`;
    }
}
