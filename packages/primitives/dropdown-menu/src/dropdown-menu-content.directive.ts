import { CdkMenu, CdkTargetMenuAim } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[rdxDropdownMenuContent]',
    standalone: true,
    hostDirectives: [CdkMenu, CdkTargetMenuAim]
})
export class RdxDropdownMenuContentDirective {}
