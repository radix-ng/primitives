import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuContent]',
    standalone: true,
    hostDirectives: [CdkMenu]
})
export class RdxMenuContentDirective {}
