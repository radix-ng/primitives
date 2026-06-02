import { Directive } from '@angular/core';
import { injectSelectItemContext } from './select-item';

@Directive({
    selector: '[rdxSelectItemIndicator]',
    host: {
        '[attr.aria-hidden]': 'true',
        '[hidden]': '!itemContext.isSelected()'
    }
})
export class RdxSelectItemIndicator {
    readonly itemContext = injectSelectItemContext()!;
}
