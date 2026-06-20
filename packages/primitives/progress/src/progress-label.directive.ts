import { DestroyRef, Directive, inject } from '@angular/core';
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

    constructor() {
        // Register presence so the root's `aria-labelledby` only resolves while a label exists.
        inject(DestroyRef).onDestroy(this.progress.registerLabel());
    }
}
