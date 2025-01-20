import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuRoot],[MenuSub]',
    hostDirectives: [CdkMenu]
})
export class RdxMenuDirective {}
