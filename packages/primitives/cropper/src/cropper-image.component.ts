import { Component, computed, input } from '@angular/core';
import { injectCropperRootContext } from './cropper-context.token';

@Component({
    selector: '[rdxCropperImage]',
    host: {
        '[style]': 'rootContext.getImageWrapperStyle()'
    },
    template: `
        <img
            [class]="imgClasses()"
            [src]="rootContext.getImageProps()['src']"
            [alt]="rootContext.getImageProps()['alt']"
            [draggable]="rootContext.getImageProps()['draggable']"
            [style]="imgStyless()"
            aria-hidden="true"
        />
    `
})
export class RdxCropperImageComponent {
    protected readonly rootContext = injectCropperRootContext();

    readonly imgClass = input<string>();

    readonly imgStyles = input<string>();

    protected readonly imgClasses = computed(() => this.imgClass());

    protected readonly imgStyless = computed(() => this.imgStyles());
}
