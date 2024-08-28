import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, InjectionToken, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

export type RdxAccordionType = 'single' | 'multiple';
export type RdxAccordionOrientation = 'horizontal' | 'vertical';

export const RdxAccordionRootToken = new InjectionToken<RdxAccordionRootDirective>('RdxAccordionRootDirective');

let nextId = 0;

@Directive({
    selector: '[rdxAccordionRoot]',
    standalone: true,
    providers: [
        { provide: RdxAccordionRootToken, useExisting: RdxAccordionRootDirective },
        { provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }
    ],
    host: {
        '[attr.data-orientation]': 'orientation'
    }
})
export class RdxAccordionRootDirective implements OnInit, OnDestroy, OnChanges {
    readonly id: string = `rdx-accordion-${nextId++}`;

    readonly stateChanges = new Subject<SimpleChanges>();
    readonly openCloseAllActions = new Subject<boolean>();

    get multi(): boolean {
        return this.type === 'multiple';
    }

    /**
     * The orientation of the accordion.
     */
    @Input() orientation: RdxAccordionOrientation = 'vertical';
    /**
     * @private
     * @ignore
     */
    // private readonly accordionItems = contentChildren(RdxAccordionItemToken);
    /**
     * @private
     * @ignore
     */
    private _value: string[] = [];
    /**
     * The value of the item to expand when initially rendered and type is "single". Use when you do not need to control the state of the items.
     */
    @Input() defaultValue: string[] = [];
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
    @Input()
    set value(value: string | string[] | undefined) {
        if (value !== undefined) {
            this._value = Array.isArray(value) ? value : [value];
        } else {
            this._value = this.defaultValue;
        }

        this.onValueChange(this._value);
    }

    /**
     * @ignore
     */
    ngOnInit(): void {
        if (this.defaultValue) {
            this.value = this.defaultValue;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.stateChanges.next(changes);
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.openCloseAllActions.complete();
    }

    /**
     * @ignore
     */
    onValueChange(value: string[]): void {
        // if (this.type === 'single') {
        //     const currentValue = value.length > 0 ? value[0] : undefined;
        //
        //     // this.accordionItems().forEach((accordionItem) => {
        //     //     if (accordionItem.value === currentValue) {
        //             accordionItem.setOpen();
        //         // } else {
        //             accordionItem.setOpen('closed');
        //         // }
        //     // });
        // } else {
        //     value.forEach((valueItem) => {
        //         this.accordionItems().forEach((accordionItem) => {
        //             if (accordionItem.value === valueItem) {
        //                 // accordionItem.setOpen();
        //             }
        //         });
        //     });
        // }
    }

    /** Opens all enabled accordion items in an accordion where multi is enabled. */
    openAll(): void {
        if (this.multi) {
            this.openCloseAllActions.next(true);
        }
    }

    /** Closes all enabled accordion items. */
    closeAll(): void {
        this.openCloseAllActions.next(false);
    }
}
