import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[RdxMenuBarRadioGroup]',
    hostDirectives: [CdkMenuGroup]
})
export class RdxMenubarRadioGroupDirective {}
