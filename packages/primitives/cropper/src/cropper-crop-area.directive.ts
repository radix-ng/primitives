import { Directive } from '@angular/core';
import { injectCropperRootContext } from './cropper-context.token';

@Directive({
    selector: '[rdxCropperCropArea]',
    host: {
        '[style]': 'rootContext.cropAreaStyle()'
    }
})
export class RdxCropperCropAreaDirective {
    readonly rootContext = injectCropperRootContext();
}
