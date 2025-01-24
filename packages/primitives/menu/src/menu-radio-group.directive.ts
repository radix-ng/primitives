import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[RdxMenuRadioGroup]',
    hostDirectives: [CdkMenuGroup]
})
export class RdxMenuRadioGroupDirective {}
