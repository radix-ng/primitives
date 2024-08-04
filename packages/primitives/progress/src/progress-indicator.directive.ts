import { Directive } from '@angular/core';
import { injectProgress } from './progress-root.directive';

@Directive({
    selector: 'div[rdxProgressIndicator]',
    exportAs: 'ProgressIndicator',
    standalone: true,
    host: {
        '[attr.data-state]': 'progress.state',
        '[attr.data-value]': 'progress.value',
        '[attr.data-max]': 'progress.max'
    }
})
export class RdxProgressIndicatorDirective {
    protected readonly progress = injectProgress();
}
