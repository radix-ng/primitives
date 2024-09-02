import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    AfterContentInit,
    Directive,
    inject,
    InjectionToken,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges
} from '@angular/core';
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
export class RdxAccordionRootDirective implements AfterContentInit, OnDestroy, OnChanges {
    protected readonly selectionDispatcher = inject(UniqueSelectionDispatcher);

    readonly id: string = `rdx-accordion-${nextId++}`;

    readonly stateChanges = new Subject<SimpleChanges>();
    readonly openCloseAllActions = new Subject<boolean>();

    get isMultiple(): boolean {
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
    set value(value: string[]) {
        if (value !== this._value) {
            this._value = Array.isArray(value) ? value : [value];
        }
    }

    get value(): string[] {
        return this._value || this.defaultValue;
    }

    /**
     * @private
     * @ignore
     */
    private _value?: string[];

    /**
     * @ignore
     */
    ngAfterContentInit(): void {
        this.selectionDispatcher.notify(this.value as unknown as string, this.id);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.stateChanges.next(changes);
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.openCloseAllActions.complete();
    }

    /** Opens all enabled accordion items in an accordion where multi is enabled. */
    openAll(): void {
        if (this.isMultiple) {
            this.openCloseAllActions.next(true);
        }
    }

    /** Closes all enabled accordion items. */
    closeAll(): void {
        this.openCloseAllActions.next(false);
    }
}
