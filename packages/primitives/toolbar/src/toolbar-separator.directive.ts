import { Directive } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

@Directive({
    selector: '[rdxToolbarSeparator]',
    hostDirectives: [{ directive: RdxSeparatorRootDirective, inputs: ['orientation'] }]
})
export class RdxToolbarSeparatorDirective {}
