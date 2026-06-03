import { injectSelectItemContext } from './select-item';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxSelectItemIndicator]',
    host: {
        '[attr.aria-hidden]': 'true',
        '[hidden]': '!itemContext.isSelected()'
    }
})
export class RdxSelectItemIndicator {
    readonly itemContext = injectSelectItemContext();
}
