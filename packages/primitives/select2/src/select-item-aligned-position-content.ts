import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[rdxSelectItemAlignedPositionContent]',
    host: {
        '[style]': `{
            boxSizing: 'border-box',
            maxHeight: '100%'
        }`
    }
})
export class RdxSelectItemAlignedPositionContent {
    readonly currentElementRef = inject(ElementRef);
}
