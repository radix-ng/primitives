import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    booleanAttribute,
    ContentChildren,
    Directive,
    EventEmitter,
    forwardRef,
    inject,
    InjectionToken,
    Input,
    OnDestroy,
    Output,
    QueryList
} from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';
import { RdxAccordionItemDirective } from './accordion-item.directive';

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
        '[attr.data-orientation]': 'orientation',
        '(keydown)': 'handleKeydown($event)'
    }
})
export class RdxAccordionRootDirective implements AfterContentInit, OnDestroy {
    protected readonly selectionDispatcher = inject(UniqueSelectionDispatcher);
    protected readonly dir = inject(Directionality, { optional: true });

    protected keyManager: FocusKeyManager<RdxAccordionItemDirective>;

    readonly id: string = `rdx-accordion-${nextId++}`;

    readonly openCloseAllActions = new Subject<boolean>();

    get isMultiple(): boolean {
        return this.type === 'multiple';
    }

    /** Whether the Accordion is disabled. */
    @Input({ transform: booleanAttribute }) disabled: boolean;

    /**
     * The orientation of the accordion.
     */
    @Input() orientation: RdxAccordionOrientation = 'vertical';
    /**
     * @private
     * @ignore
     */
    @ContentChildren(forwardRef(() => RdxAccordionItemDirective), { descendants: true })
    items: QueryList<RdxAccordionItemDirective>;
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

            this.selectionDispatcher.notify(this.value as unknown as string, this.id);
        }
    }

    get value(): string[] {
        return this._value ?? this.defaultValue;
    }

    @Output() readonly onValueChange: EventEmitter<void> = new EventEmitter<void>();

    /**
     * @private
     * @ignore
     */
    private _value?: string[];

    private onValueChangeSubscription: Subscription;

    /**
     * @ignore
     */
    ngAfterContentInit(): void {
        this.selectionDispatcher.notify(this.value as unknown as string, this.id);

        this.keyManager = new FocusKeyManager(this.items).withHomeAndEnd();

        if (this.orientation === 'horizontal') {
            this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
        } else {
            this.keyManager.withVerticalOrientation();
        }

        this.onValueChangeSubscription = merge(...this.items.map((item) => item.expandedChange)).subscribe(() =>
            this.onValueChange.emit()
        );
    }

    /**
     * @ignore
     */
    ngOnDestroy() {
        this.openCloseAllActions.complete();
        this.onValueChangeSubscription.unsubscribe();
    }

    /**
     * @ignore
     */
    handleKeydown(event: KeyboardEvent) {
        if (!this.keyManager.activeItem) {
            this.keyManager.setFirstItemActive();
        }

        const activeItem = this.keyManager.activeItem;

        if (
            (event.keyCode === ENTER || event.keyCode === SPACE) &&
            !this.keyManager.isTyping() &&
            activeItem &&
            !activeItem.disabled
        ) {
            event.preventDefault();
            activeItem.toggle();
        } else {
            this.keyManager.onKeydown(event);
        }
    }

    /** Opens all enabled accordion items in an accordion where multi is enabled.
     * @ignore
     */
    openAll(): void {
        if (this.isMultiple) {
            this.openCloseAllActions.next(true);
        }
    }

    /** Closes all enabled accordion items.
     * @ignore
     */
    closeAll(): void {
        this.openCloseAllActions.next(false);
    }

    /**
     * @ignore
     */
    setActiveItem(item: RdxAccordionItemDirective) {
        this.keyManager.setActiveItem(item);
    }
}
