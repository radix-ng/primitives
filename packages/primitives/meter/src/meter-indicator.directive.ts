import { Directive, ElementRef, inject } from '@angular/core';
import { injectMeterRootContext } from './meter-root.directive';

/**
 * Displays the visual meter fill.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxMeterIndicator]',
    exportAs: 'rdxMeterIndicator',
    host: {
        '[attr.data-value]': 'meter.valueState()',
        '[attr.data-min]': 'meter.minState()',
        '[attr.data-max]': 'meter.maxState()',
        '[attr.data-percent]': 'meter.percentageState()',
        '[style.width.%]': 'isHtml ? meter.percentageState() : null',
        '[style.height]': 'isHtml ? "inherit" : null',
        '[style.inset-inline-start]': 'isHtml ? "0px" : null'
    }
})
export class RdxMeterIndicatorDirective {
    protected readonly meter = injectMeterRootContext();
    protected readonly isHtml =
        inject<ElementRef<Element>>(ElementRef).nativeElement.namespaceURI === 'http://www.w3.org/1999/xhtml';
}
