import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuBarTrigger]',
    standalone: true,
    hostDirectives: [CdkMenuTrigger],
    host: {}
})
export class RdxMenuBarTriggerDirective {}
