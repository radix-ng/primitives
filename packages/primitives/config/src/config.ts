import { Direction } from '@angular/cdk/bidi';
import { Injectable, signal } from '@angular/core';

export type RadixNGConfig = {
    /**
     * The global reading direction of your application. This will be inherited by all primitives.
     * @defaultValue 'ltr'
     */
    dir?: Direction;

    /**
     * The global locale of your application. This will be inherited by all primitives.
     * @defaultValue 'en'
     */
    locale?: string;
};

@Injectable({ providedIn: 'root' })
export class RadixNG {
    readonly dir = signal<Direction>('ltr');

    readonly locale = signal<string>('en');

    setConfig(config: RadixNGConfig): void {
        const { dir, locale } = config || {};

        if (dir) this.dir.set(dir);
        if (locale) this.locale.set(locale);
    }
}
