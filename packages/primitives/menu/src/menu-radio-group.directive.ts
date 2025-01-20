import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuRadioGroup]',
    hostDirectives: [CdkMenuGroup]
})
export class RdxMenuRadioGroupDirective {}
