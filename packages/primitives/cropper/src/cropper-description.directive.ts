import { Directive } from '@angular/core';
import { injectCropperRootContext } from './cropper-context.token';

@Directive({
    selector: '[rdxCropperDescription]',
    host: {
        '[attr.id]': 'rootContext.descriptionId()'
    }
})
export class RdxCropperDescriptionDirective {
    readonly rootContext = injectCropperRootContext();
}
