import { computed, Directive, input } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
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
        '[attr.id]': 'labelId()',
        role: 'presentation',
        '[attr.data-complete]': 'dataAttr(progress.completeState())',
        '[attr.data-progressing]': 'dataAttr(progress.progressingState())',
        '[attr.data-indeterminate]': 'dataAttr(progress.indeterminateState())'
    }
})
export class RdxProgressLabelDirective {
    protected readonly progress = injectProgressRootContext();
    protected readonly dataAttr = attr;

    /** ID of this label. Defaults to the Root's label ID. */
    readonly id = input<string>();

    protected readonly labelId = computed(() => this.id() ?? this.progress.labelId());

    constructor() {
        watch([this.labelId], ([id], onCleanup) => {
            onCleanup(this.progress.registerLabel(id));
        });
    }
}
