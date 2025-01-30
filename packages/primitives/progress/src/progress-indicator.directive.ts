import { Directive } from '@angular/core';
import { injectProgress } from './progress-root.directive';

/**
 * Directive to manage progress indicator state and attributes.
 *
 * This directive is used to display the progress indicator inside the progress bar.
 * It inherits the state and value from the `RdxProgressRootDirective`.
 */
@Directive({
    selector: '[rdxProgressIndicator]',
    exportAs: 'rdxProgressIndicator',
    host: {
        '[attr.data-state]': 'progress.progressState()',
        '[attr.data-value]': 'progress.value()',
        '[attr.data-max]': 'progress.max()'
    }
})
export class RdxProgressIndicatorDirective {
    /**
     * This allows the directive to access the progress bar state and values.
     */
    protected readonly progress = injectProgress();
}
