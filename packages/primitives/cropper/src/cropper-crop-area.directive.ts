import { injectCropperRootContext } from './cropper-context.token';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxCropperCropArea]',
    host: {
        '[style]': 'rootContext.cropAreaStyle()'
    }
})
export class RdxCropperCropAreaDirective {
    readonly rootContext = injectCropperRootContext();
}
