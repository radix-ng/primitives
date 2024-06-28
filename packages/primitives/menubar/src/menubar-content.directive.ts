import { CdkMenuItem } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuBarContent]',
    standalone: true,
    hostDirectives: [CdkMenuItem],
    host: {}
})
export class RdxMenuBarContentDirective {}
