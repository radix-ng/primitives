import { Directive } from '@angular/core';

import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

@Directive({
    selector: '[MenubarSeparator]',
    standalone: true,
    hostDirectives: [RdxSeparatorRootDirective]
})
export class RdxMenubarSeparatorDirective {}
