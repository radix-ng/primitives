import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuGroup]',
    hostDirectives: [CdkMenuGroup],
    host: {
        role: 'group'
    }
})
export class RdxMenuGroupDirective {}
