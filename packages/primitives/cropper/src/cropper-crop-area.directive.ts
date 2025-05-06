import { Directive } from '@angular/core';
import { injectCropperRootContext } from './cropper-context.token';

@Directive({
    selector: '[rdxCropperCropArea]',
    host: {
        '[style]': 'rootContext.getCropAreaStyle()'
    }
})
export class RdxCropperCropAreaDirective {
    readonly rootContext = injectCropperRootContext();
}
