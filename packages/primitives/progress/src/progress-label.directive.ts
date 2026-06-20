import { Directive } from '@angular/core';
import { injectProgressRootContext } from './progress-root.directive';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Labels the progress task.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxProgressLabel]',
    exportAs: 'rdxProgressLabel',
    host: {
        '[attr.id]': 'progress.labelId()',
        '[attr.data-complete]': 'dataAttr(progress.completeState())',
        '[attr.data-progressing]': 'dataAttr(progress.progressingState())',
        '[attr.data-indeterminate]': 'dataAttr(progress.indeterminateState())'
    }
})
export class RdxProgressLabelDirective {
    protected readonly progress = injectProgressRootContext();
    protected readonly dataAttr = attr;
}
