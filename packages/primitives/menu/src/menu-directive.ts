import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuRoot],[MenuSub]',
    standalone: true,
    hostDirectives: [CdkMenu]
})
export class RdxMenuDirective {}
