import { Injectable } from '@angular/core';
import { Theme } from '@radix-ng/shadcn/theme';

type Config = {
    theme: Theme['name'];
    radius: number;
};

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private readonly CONFIG_KEY = 'config';
    private config = this.loadConfig();

    getConfig(): Config {
        return this.config;
    }

    setConfig(newConfig: Config) {
        this.config = newConfig;
        this.saveConfig(newConfig);
    }

    private loadConfig(): Config {
        const storedConfig = localStorage.getItem(this.CONFIG_KEY);
        if (storedConfig) {
            return JSON.parse(storedConfig) as Config;
        }
        return { theme: 'zinc', radius: 0.5 };
    }

    private saveConfig(config: Config) {
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    }
}
