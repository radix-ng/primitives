import { Directive } from '@angular/core';
import { injectProgressRootContext } from './progress-root.directive';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Displays the visual progress fill.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxProgressIndicator]',
    exportAs: 'rdxProgressIndicator',
    host: {
        '[attr.data-value]': 'progress.valueState() ?? undefined',
        '[attr.data-min]': 'progress.minState()',
        '[attr.data-max]': 'progress.maxState()',
        '[attr.data-percent]': 'progress.percentageState() ?? undefined',
        '[attr.data-complete]': 'dataAttr(progress.completeState())',
        '[attr.data-progressing]': 'dataAttr(progress.progressingState())',
        '[attr.data-indeterminate]': 'dataAttr(progress.indeterminateState())'
    }
})
export class RdxProgressIndicatorDirective {
    protected readonly progress = injectProgressRootContext();
    protected readonly dataAttr = attr;
}
