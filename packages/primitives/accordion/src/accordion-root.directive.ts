import { contentChildren, Directive, inject, InjectionToken, Input, OnInit } from '@angular/core';

import { RdxAccordionItemDirective, RdxAccordionItemToken } from './accordion-item.directive';

export type RdxAccordionType = 'single' | 'multiple';
export type RdxAccordionOrientation = 'horizontal' | 'vertical';

export const RdxAccordionRootToken = new InjectionToken<RdxAccordionRootDirective>(
    'RdxAccordionRootDirective'
);

export function injectAccordionRoot(): RdxAccordionRootDirective {
    return inject(RdxAccordionRootDirective);
}

@Directive({
    selector: '[AccordionRoot]',
    standalone: true,
    providers: [{ provide: RdxAccordionRootToken, useExisting: RdxAccordionRootDirective }],
    host: {
        '[attr.data-orientation]': 'getOrientation()'
    }
})
export class RdxAccordionRootDirective implements OnInit {
    private readonly accordionItems = contentChildren(RdxAccordionItemToken);
    private _orientation: RdxAccordionOrientation = 'vertical';
    private _value: RdxAccordionItemDirective[] = [];
    @Input() defaultValue?: RdxAccordionItemDirective[] = [];
    @Input() type: RdxAccordionType = 'single';
    @Input() collapsible = false;
    @Input() set value(value: RdxAccordionItemDirective | RdxAccordionItemDirective[] | undefined) {
        const changed = value !== this._value;

        if (value !== undefined) {
            this._value = Array.isArray(value) ? value : [value];
        } else {
            this._value = [];
        }

        if (changed) {
            this.onValueChange(this._value);
        }
    }
    @Input() set orientation(orientation: RdxAccordionOrientation | undefined) {
        this._orientation = orientation ?? 'vertical';
        this.accordionItems().forEach(
            (accordionItem) => (accordionItem.orientation = this._orientation)
        );
    }

    ngOnInit(): void {
        if (this.defaultValue) {
            this.value = this.defaultValue;
        }
    }

    onValueChange(value: RdxAccordionItemDirective[]): void {
        if (this.type === 'single') {
            this.accordionItems().forEach((accordionItem) => accordionItem.setOpen('closed'));
        }

        if (value.length >= 1) {
            if (this.type === 'single') {
                value[0].setOpen('open');
            }

            if (this.type === 'multiple') {
                value.forEach((valueItem) => valueItem.setOpen('open'));
            }
        }
    }

    getOrientation(): RdxAccordionOrientation {
        return this._orientation;
    }
}
