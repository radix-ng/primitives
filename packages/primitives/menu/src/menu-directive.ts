import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[Menu],[MenuSub]',
    standalone: true,
    host: {},
    hostDirectives: [CdkMenu]
})
export class RdxMenuDirective {}
