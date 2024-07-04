import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuBarContent]',
    standalone: true,
    hostDirectives: [CdkMenu]
})
export class RdxMenuBarContentDirective {}
