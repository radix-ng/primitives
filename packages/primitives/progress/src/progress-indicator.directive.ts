import { Directive } from '@angular/core';
import { injectProgress } from './progress.token';

@Directive({
    selector: '[rdxProgressIndicator]',
    standalone: true,
    host: {
        '[attr.data-state]': 'progress.state',
        '[attr.data-value]': 'progress.value',
        '[attr.data-max]': 'progress.max'
    }
})
export class ProgressIndicatorDirective {
    protected readonly progress = injectProgress();
}
