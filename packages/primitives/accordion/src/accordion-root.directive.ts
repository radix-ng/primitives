import { contentChildren, Directive, inject, InjectionToken, Input, OnInit } from '@angular/core';

import { RdxAccordionItemToken } from './accordion-item.directive';

export type RdxAccordionType = 'single' | 'multiple';
export type RdxAccordionOrientation = 'horizontal' | 'vertical';

export const RdxAccordionRootToken = new InjectionToken<RdxAccordionRootDirective>(
    'RdxAccordionRootDirective'
);

export function injectAccordionRoot(): RdxAccordionRootDirective {
    return inject(RdxAccordionRootDirective);
}

@Directive({
    selector: '[rdxAccordionRoot]',
    standalone: true,
    providers: [{ provide: RdxAccordionRootToken, useExisting: RdxAccordionRootDirective }],
    host: {
        '[attr.data-orientation]': 'getOrientation()'
    }
})
export class RdxAccordionRootDirective implements OnInit {
    /**
     * @private
     * @ignore
     */
    private readonly accordionItems = contentChildren(RdxAccordionItemToken);
    /**
     * @private
     * @ignore
     */
    private _orientation: RdxAccordionOrientation = 'vertical';
    /**
     * @private
     * @ignore
     */
    private _value: string[] = [];
    /**
     * The value of the item to expand when initially rendered and type is "single". Use when you do not need to control the state of the items.
     */
    @Input() defaultValue?: string[] = [];
    /**
     * Determines whether one or multiple items can be opened at the same time.
     */
    @Input() type: RdxAccordionType = 'single';
    /**
     * @ignore
     */
    @Input() collapsible = true;
    /**
     * The controlled value of the item to expand
     */
    @Input() set value(value: string | string[] | undefined) {
        if (value !== undefined) {
            this._value = Array.isArray(value) ? value : [value];
        } else {
            this._value = [];
        }

        this.onValueChange(this._value);
    }
    /**
     * The orientation of the accordion.
     */
    @Input() set orientation(orientation: RdxAccordionOrientation | undefined) {
        this._orientation = orientation ?? 'vertical';
        this.accordionItems().forEach((accordionItem) =>
            accordionItem.setOrientation(this._orientation)
        );
    }

    /**
     * @ignore
     */
    ngOnInit(): void {
        if (this.defaultValue) {
            this.value = this.defaultValue;
        }
    }

    /**
     * @ignore
     */
    onValueChange(value: string[]): void {
        if (this.type === 'single') {
            const currentValue = value.length > 0 ? value[0] : undefined;

            this.accordionItems().forEach((accordionItem) => {
                if (accordionItem.value === currentValue) {
                    accordionItem.setOpen();
                } else {
                    accordionItem.setOpen('closed');
                }
            });
        } else {
            value.forEach((valueItem) => {
                this.accordionItems().forEach((accordionItem) => {
                    if (accordionItem.value === valueItem) {
                        accordionItem.setOpen();
                    }
                });
            });
        }
    }

    /**
     * @ignore
     */
    getOrientation(): RdxAccordionOrientation {
        return this._orientation;
    }
}
