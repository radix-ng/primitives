import { computed, Directive, effect, inject, input, model, signal } from '@angular/core';
import classNames from 'classnames';
import { ThemeService } from './theme.service';

@Directive({
    selector: '[rdxTheme]',
    standalone: true,
    providers: [ThemeService],
    host: {
        '[attr.data-radius]': 'radius()',
        '[attr.data-scaling]': 'scaling()',
        '[attr.data-gray-color]': 'grayColor()',
        '[attr.data-accent-color]': 'accentColor()',
        '[attr.data-is-root-theme]': 'isRoot()',

        '[class]': 'computedClass()'
    }
})
export class RdxThemeDirective {
    private readonly themeService = inject(ThemeService);

    readonly class = input<string>();
    protected computedClass = computed(() =>
        classNames(
            'radix-themes',
            {
                light: this.appearance() === 'light',
                dark: this.appearance() === 'dark'
            },
            this.class()
        )
    );

    appearance = signal<string>('inherit');
    accentColor = signal<string>('indigo');
    grayColor = signal<string>('auto');
    panelBackground = signal<string>('translucent');
    radius = signal<string>('medium');
    scaling = signal<string>('100%');

    isRoot = model<boolean>(false);

    constructor() {
        effect(() => {
            this.themeService.setAppearance(this.appearance());
            this.themeService.setAccentColor(this.accentColor());
            this.themeService.setGrayColor(this.grayColor());
            this.themeService.setPanelBackground(this.panelBackground());
            this.themeService.setRadius(this.radius());
            this.themeService.setScaling(this.scaling());
        });
    }
}
