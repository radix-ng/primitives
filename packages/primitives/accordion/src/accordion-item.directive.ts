import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    booleanAttribute,
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    SkipSelf
} from '@angular/core';
import { Subscription } from 'rxjs';
import { RdxAccordionOrientation, RdxAccordionRootDirective, RdxAccordionRootToken } from './accordion-root.directive';

export type RdxAccordionItemState = 'open' | 'closed';

let nextId = 0;

@Directive({
    selector: '[rdxAccordionItem]',
    standalone: true,
    exportAs: 'rdxAccordionItem',
    host: {
        '[attr.data-state]': 'dataState',
        '[attr.data-disabled]': 'disabled',
        '[attr.data-orientation]': 'accordion.orientation'
    },
    providers: [
        { provide: RdxAccordionRootToken, useValue: undefined }]
})
export class RdxAccordionItemDirective implements OnDestroy {
    get dataState(): RdxAccordionItemState {
        return this.expanded ? 'open' : 'closed';
    }

    /** The unique AccordionItem id. */
    readonly id: string = `rdx-accordion-item-${nextId++}`;

    public orientation: RdxAccordionOrientation = 'vertical';

    /** Whether the AccordionItem is expanded. */
    @Input({ transform: booleanAttribute })
    set expanded(expanded: boolean) {
        // Only emit events and update the internal value if the value changes.
        if (this._expanded !== expanded) {
            this._expanded = expanded;
            this.expandedChange.emit(expanded);

            if (expanded) {
                this.opened.emit();
                /**
                 * In the unique selection dispatcher, the id parameter is the id of the CdkAccordionItem,
                 * the name value is the id of the accordion.
                 */
                const accordionId = this.accordion ? this.accordion.id : this.value;
                this.expansionDispatcher.notify(this.value, accordionId);
            } else {
                this.closed.emit();
            }

            // Ensures that the animation will run when the value is set outside of an `@Input`.
            // This includes cases like the open, close and toggle methods.
            this.changeDetectorRef.markForCheck();
        }
    }

    get expanded(): boolean {
        return this._expanded;
    }

    private _expanded = false;

    @Input()
    set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value || this.id;
    }

    private _value?: string;

    /** Whether the AccordionItem is disabled. */
    @Input({ transform: booleanAttribute }) disabled: boolean = false;

    /** Event emitted every time the AccordionItem is closed. */
    @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();
    /** Event emitted every time the AccordionItem is opened. */
    @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();
    /** Event emitted when the AccordionItem is destroyed. */
    @Output() readonly destroyed: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Emits whenever the expanded state of the accordion changes.
     * Primarily used to facilitate two-way binding.
     * @docs-private
     */
    @Output() readonly expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Unregister function for _expansionDispatcher. */
    private removeUniqueSelectionListener: () => void = () => {};

    /** Subscription to openAll/closeAll events. */
    private openCloseAllSubscription = Subscription.EMPTY;

    constructor(
        @Optional() @Inject(RdxAccordionRootToken) @SkipSelf() public accordion: RdxAccordionRootDirective,
        private changeDetectorRef: ChangeDetectorRef,
        protected expansionDispatcher: UniqueSelectionDispatcher
    ) {
        this.removeUniqueSelectionListener = this.expansionDispatcher.listen((id: string, accordionId: string) => {
            if (this.accordion.isMultiple) {
                if (this.accordion.id === accordionId && id.includes(this.value)) {
                    this.expanded = true;
                }
            } else {
                this.expanded = this.accordion.id === accordionId && id.includes(this.value);
            }
        });

        // When an accordion item is hosted in an accordion, subscribe to open/close events.
        if (this.accordion) {
            this.openCloseAllSubscription = this.subscribeToOpenCloseAllActions();
        }
    }

    /** Emits an event for the accordion item being destroyed. */
    ngOnDestroy() {
        this.opened.complete();
        this.closed.complete();
        this.destroyed.emit();
        this.destroyed.complete();
        this.removeUniqueSelectionListener();
        this.openCloseAllSubscription.unsubscribe();
    }

    /** Toggles the expanded state of the accordion item. */
    toggle(): void {
        if (!this.disabled) {
            this.expanded = !this.expanded;
        }
    }

    /** Sets the expanded state of the accordion item to false. */
    close(): void {
        if (!this.disabled) {
            this.expanded = false;
        }
    }

    /** Sets the expanded state of the accordion item to true. */
    open(): void {
        if (!this.disabled) {
            this.expanded = true;
        }
    }

    private subscribeToOpenCloseAllActions(): Subscription {
        return this.accordion.openCloseAllActions.subscribe((expanded) => {
            // Only change expanded state if item is enabled
            if (!this.disabled) {
                this.expanded = expanded;
            }
        });
    }
}
