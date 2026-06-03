import { injectCropperRootContext } from './cropper-context.token';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxCropperDescription]',
    host: {
        '[attr.id]': 'rootContext.descriptionId'
    }
})
export class RdxCropperDescriptionDirective {
    readonly rootContext = injectCropperRootContext();
}
