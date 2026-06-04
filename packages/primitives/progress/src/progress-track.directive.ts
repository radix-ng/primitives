import { Directive } from '@angular/core';
import { injectProgressRootContext } from './progress-root.directive';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Contains the visual progress indicator.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxProgressTrack]',
    exportAs: 'rdxProgressTrack',
    host: {
        '[attr.data-state]': 'progress.progressState()',
        '[attr.data-value]': 'progress.valueState() ?? undefined',
        '[attr.data-min]': 'progress.minState()',
        '[attr.data-max]': 'progress.maxState()',
        '[attr.data-complete]': 'dataAttr(progress.completeState())',
        '[attr.data-progressing]': 'dataAttr(progress.progressingState())',
        '[attr.data-indeterminate]': 'dataAttr(progress.indeterminateState())'
    }
})
export class RdxProgressTrackDirective {
    protected readonly progress = injectProgressRootContext()!;
    protected readonly dataAttr = attr;
}
