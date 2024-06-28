import { CdkMenuBar } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
    selector: '[MenuBarRoot]',
    standalone: true,
    hostDirectives: [CdkMenuBar],
    host: {
        tabindex: '0',
        '[attr.data-orientation]': "'horizontal'"
    }
})
export class RdxMenuBarDirective {}
