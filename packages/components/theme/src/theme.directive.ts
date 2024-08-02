import { Directive, effect, ElementRef, inject, OnChanges, OnInit, Renderer2, signal } from '@angular/core';
import { ThemeService } from './theme.service';

@Directive({
    selector: '[rdxAppTheme]',
    standalone: true
})
export class RdxThemeDirective implements OnInit, OnChanges {
    private readonly themeService = inject(ThemeService);
    private readonly elementRef = inject(ElementRef);
    private readonly renderer = inject(Renderer2);

    appearance = signal<string>('default');
    accentColor = signal<string>('default');
    grayColor = signal<string>('default');
    panelBackground = signal<string>('default');
    radius = signal<string>('default');
    scaling = signal<string>('default');

    isRoot = signal<boolean>(false);

    ngOnInit() {
        this.applyTheme();
        effect(() => this.updateClasses());
    }

    ngOnChanges() {
        this.applyTheme();
    }

    private applyTheme() {
        this.themeService.setAppearance(this.appearance());
        this.themeService.setAccentColor(this.accentColor());
        this.themeService.setGrayColor(this.grayColor());
        this.themeService.setPanelBackground(this.panelBackground());
        this.themeService.setRadius(this.radius());
        this.themeService.setScaling(this.scaling());
    }

    private updateClasses() {
        const context = this.themeService.contextSignal();

        const themeClasses = {
            'theme-light': context.appearance === 'light',
            'theme-dark': context.appearance === 'dark',
            'theme-accent-blue': context.accentColor === 'blue',
            'theme-gray-auto': context.grayColor === 'auto'
            // Add more classes as necessary
        };

        for (const [key, value] of Object.entries(themeClasses)) {
            if (value) {
                this.renderer.addClass(this.elementRef.nativeElement, key);
            } else {
                this.renderer.removeClass(this.elementRef.nativeElement, key);
            }
        }
    }

    private updateAttributes() {
        const context = this.themeService.contextSignal();

        this.renderer.setAttribute(
            this.elementRef.nativeElement,
            'data-is-root-theme',
            this.isRoot() ? 'true' : 'false'
        );
        this.renderer.setAttribute(this.elementRef.nativeElement, 'data-accent-color', context.accentColor);
        this.renderer.setAttribute(this.elementRef.nativeElement, 'data-gray-color', context.grayColor);

        this.renderer.setAttribute(this.elementRef.nativeElement, 'data-radius', context.radius);
        this.renderer.setAttribute(this.elementRef.nativeElement, 'data-scaling', context.scaling);
    }
}
