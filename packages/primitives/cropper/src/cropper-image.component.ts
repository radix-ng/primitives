import { injectCropperRootContext } from './cropper-context.token';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: '[rdxCropperImage]',
    host: {
        '[style]': 'rootContext.imageWrapperStyle()'
    },
    template: `
        <img
            [class]="imgClass()"
            [src]="rootContext.image()"
            [style]="imgStyles()"
            [draggable]="false"
            [alt]="imgAlt()"
        />
    `
})
export class RdxCropperImageComponent {
    protected readonly rootContext = injectCropperRootContext();

    readonly imgClass = input<string>();

    readonly imgStyles = input<string>();

    /**
     * `alt` text for the rendered image. Defaults to `''` (decorative — screen readers skip it, since
     * the cropper widget describes itself via the root's label/description). Set a non-empty value to
     * give the image a meaningful accessible name.
     */
    readonly imgAlt = input('');
}
