import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[rdxSelectItemAlignedPositionContent]',
    host: {
        '[style]': `{
            boxSizing: 'border-box'
        }`
    }
})
export class RdxSelectItemAlignedPositionContent {
    readonly currentElementRef = inject(ElementRef);
}
