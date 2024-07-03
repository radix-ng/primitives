import { CdkMenuBar } from '@angular/cdk/menu';
import { Directive, input } from '@angular/core';

@Directive({
    selector: '[MenuBarRoot]',
    standalone: true,
    hostDirectives: [CdkMenuBar],
    host: {
        tabindex: '0',
        '[attr.data-orientation]': 'orientation()'
    }
})
export class RdxMenuBarDirective {
    readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
