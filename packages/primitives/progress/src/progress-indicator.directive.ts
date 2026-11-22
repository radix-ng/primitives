import { computed, Directive, ElementRef, inject } from '@angular/core';
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
        '[style.width.%]': 'linearPercentage()',
        '[style.height]': 'linearPercentage() === null ? null : "inherit"',
        '[style.inset-inline-start]': 'linearPercentage() === null ? null : "0px"',
        '[attr.data-complete]': 'dataAttr(progress.completeState())',
        '[attr.data-progressing]': 'dataAttr(progress.progressingState())',
        '[attr.data-indeterminate]': 'dataAttr(progress.indeterminateState())'
    }
})
export class RdxProgressIndicatorDirective {
    private readonly isHtml =
        inject<ElementRef<Element>>(ElementRef).nativeElement.namespaceURI === 'http://www.w3.org/1999/xhtml';
    protected readonly progress = injectProgressRootContext();
    protected readonly linearPercentage = computed(() => (this.isHtml ? this.progress.percentageState() : null));
    protected readonly dataAttr = attr;
}
