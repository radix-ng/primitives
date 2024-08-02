import { Directive } from '@angular/core';
import { injectProgress } from './progress-root.directive';

@Directive({
    selector: 'div[ProgressIndicator]',
    exportAs: 'ProgressIndicator',
    standalone: true,
    host: {
        '[attr.data-state]': '_progress.state',
        '[attr.data-value]': '_progress.value',
        '[attr.data-max]': '_progress.max'
    }
})
export class RdxProgressIndicatorDirective {
    readonly _progress = injectProgress();
}
