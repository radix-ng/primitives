import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[RdxMenuRoot],[RdxMenuSub]',
    hostDirectives: [CdkMenu]
})
export class RdxMenuDirective {}
