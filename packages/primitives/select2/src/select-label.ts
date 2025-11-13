import { Directive } from '@angular/core';
import { injectSelectGroupContext } from './select-group';

@Directive({
    selector: '[rdxSelectLabel]',
    host: {
        '[id]': 'groupContext.id'
    }
})
export class RdxSelectLabel {
    readonly groupContext = injectSelectGroupContext()!;
}
