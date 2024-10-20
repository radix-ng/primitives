import { NumberInput } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    Renderer2
} from '@angular/core';

@Directive({
    selector: '[rdxAspectRatio]',
    exportAs: 'rdxAspectRatio',
    standalone: true,
    host: {
        '[style.position]': `'relative'`,
        '[style.width]': `'100%'`,
        '[style.padding-bottom]': 'paddingBottom()'
    }
})
export class RdxAspectRatioDirective implements AfterViewInit {
    private element = inject(ElementRef);
    private renderer = inject(Renderer2);

    readonly ratio = input<number, NumberInput>(1, { transform: numberAttribute });

    protected readonly paddingBottom = computed(() => `${(1 / this.ratio()) * 100}%`);

    ngAfterViewInit() {
        const content = this.element.nativeElement.firstElementChild;
        if (content) {
            this.renderer.setStyle(content, 'position', 'absolute');
            this.renderer.setStyle(content, 'inset', '0');
        }
    }
}
