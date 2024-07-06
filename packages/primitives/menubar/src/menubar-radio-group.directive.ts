import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenubarRadioGroup]',
    standalone: true,
    hostDirectives: [CdkMenuGroup]
})
export class RdxMenubarRadioGroupDirective {}
