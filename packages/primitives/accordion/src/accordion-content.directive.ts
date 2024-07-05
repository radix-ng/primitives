import { Directive, ElementRef, inject, InjectionToken, Input } from '@angular/core';

import { RdxAccordionItemState } from './accordion-item.directive';
import { RdxAccordionOrientation } from './accordion-root.directive';
import { RdxCdkAccordionItem, RdxCdkAccordionItemToken } from './cdk-accordion-item.directive';

export const RdxAccordionContentToken = new InjectionToken<RdxAccordionContentDirective>(
    'RdxAccordionContentToken'
);

@Directive({
    selector: '[AccordionContent]',
    standalone: true,
    exportAs: 'AccordionContent',
    providers: [
        { provide: RdxAccordionContentToken, useExisting: RdxAccordionContentDirective },
        {
            provide: RdxCdkAccordionItemToken,
            useExisting: RdxCdkAccordionItem
        }
    ],
    host: {
        /*'[attr.hidden]': '_hidden ? "" : undefined',*/
        '[attr.data-state]': 'state',
        '[attr.data-disabled]': 'getDisabled()',
        '[attr.data-orientation]': 'orientation'
    },
    hostDirectives: [RdxCdkAccordionItem]
})
export class RdxAccordionContentDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    state: RdxAccordionItemState = 'closed';
    cdkAccordionItem = inject(RdxCdkAccordionItemToken);
    orientation: RdxAccordionOrientation = 'vertical';
    @Input() disabled = false;

    setOpen(state?: RdxAccordionItemState | undefined): void {
        if (this.disabled) {
            return;
        }

        if (state === undefined) {
            this.state = this.state === 'open' ? 'closed' : 'open';
        } else {
            this.state = state;
        }

        if (this.state === 'open') {
            this.elementRef.nativeElement.removeAttribute('hidden');
        } else {
            this.elementRef.nativeElement.setAttribute('hidden', '');
        }
    }

    getDisabled(): string | undefined {
        return this.disabled ? '' : undefined;
    }
}
