import { CdkMenuGroup } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[RdxMenuGroup]',
    hostDirectives: [CdkMenuGroup],
    host: {
        role: 'group'
    }
})
export class RdxMenuGroupDirective {}
