import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
    selector: '[rdxSelectItemAlignedPositionContent]',
    host: {
        '[style]': `{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: '0',
            overflow: 'hidden'
        }`
    }
})
export class RdxSelectItemAlignedPositionContent {
    readonly currentElementRef = inject(ElementRef);
}
