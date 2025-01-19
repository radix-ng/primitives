import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuContent]',
    hostDirectives: [CdkMenu],
    host: {
        role: 'menu',
        '[attr.aria-orientation]': '"vertical"'
    }
})
export class RdxMenuContentDirective {}
