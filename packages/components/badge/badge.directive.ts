import {
    Directive,
    ElementRef,
    Inject,
    Input,
    OnChanges,
    Optional,
    Renderer2,
    SimpleChanges
} from '@angular/core';
import { BADGE_VARIANTS_TOKEN, BadgeVariants } from './badge-variants.token';

interface BadgeStyle {
    [key: string]: any;
}

interface BadgeVariantStyles {
    [variant: string]: BadgeStyle | undefined;
}

@Directive({
    selector: '[kbqBadge]',
    standalone: true
})
export class BadgeDirective implements OnChanges {
    @Input() variant: string = 'default';
    @Input() styles: BadgeVariantStyles = {};

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        @Optional() @Inject(BADGE_VARIANTS_TOKEN) private badgeVariants?: BadgeVariants
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['variant'] || changes['styles']) {
            this.applyStyle();
        }
    }

    private applyStyle(): void {
        if (this.isValidVariant(this.variant)) {
            const styleVariant = this.styles[this.variant];
            if (styleVariant) {
                this.clearStyles();
                Object.entries(styleVariant).forEach(([styleName, styleValue]) => {
                    this.renderer.setStyle(this.el.nativeElement, styleName, styleValue);
                });
            } else {
                console.warn(
                    `Unsupported badge variant '${this.variant}'. Please provide a supported variant.`
                );
            }
        }
    }

    private clearStyles(): void {
        const styleVariant = this.styles[this.variant];
        if (styleVariant) {
            Object.keys(styleVariant).forEach((style) => {
                this.renderer.removeStyle(this.el.nativeElement, style);
            });
        }
    }

    private isValidVariant(variant: string): boolean {
        return !this.badgeVariants || this.badgeVariants.variants.includes(variant);
    }
}

// @NgModule({
//     providers: [
//         {
//             provide: BADGE_VARIANTS_TOKEN,
//             useValue: { variants: ['default', 'secondary', 'customVariant'] }
//         }
//     ],
//
// })
// export class AppModule {}
