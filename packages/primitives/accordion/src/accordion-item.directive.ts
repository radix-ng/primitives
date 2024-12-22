import { FocusableOption } from '@angular/cdk/a11y';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    booleanAttribute,
    ChangeDetectorRef,
    ContentChild,
    Directive,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    OnDestroy,
    Output
} from '@angular/core';
import { Subscription } from 'rxjs';
import { RdxAccordionContentDirective } from './accordion-content.directive';
import { RdxAccordionOrientation, RdxAccordionRootToken } from './accordion-root.directive';
import { RdxAccordionTriggerDirective } from './accordion-trigger.directive';

export type RdxAccordionItemState = 'open' | 'closed';

let nextId = 0;

/**
 * @group Components
 */
@Directive({
    selector: '[rdxAccordionItem]',
    standalone: true,
    exportAs: 'rdxAccordionItem',
    host: {
        '[attr.data-state]': 'dataState',
        '[attr.data-disabled]': 'disabled',
        '[attr.data-orientation]': 'orientation'
    },
    providers: [
        { provide: RdxAccordionRootToken, useValue: undefined }]
})
export class RdxAccordionItemDirective implements FocusableOption, OnDestroy {
    protected readonly accordion = inject(RdxAccordionRootToken, { skipSelf: true });

    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly expansionDispatcher = inject(UniqueSelectionDispatcher);

    /**
     * @ignore
     */
    @ContentChild(RdxAccordionTriggerDirective, { descendants: true }) trigger: RdxAccordionTriggerDirective;

    /**
     * @ignore
     */
    @ContentChild(forwardRef(() => RdxAccordionContentDirective), { descendants: true })
    content: RdxAccordionContentDirective;

    get dataState(): RdxAccordionItemState {
        return this.expanded ? 'open' : 'closed';
    }

    /**
     * The unique AccordionItem id.
     * @ignore
     */
    readonly id: string = `rdx-accordion-item-${nextId++}`;

    get orientation(): RdxAccordionOrientation {
        return this.accordion.orientation;
    }

    /**
     * @defaultValue false
     * @group Props
     */
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

    /**
     * Accordion value.
     *
     * @group Props
     */
    @Input() set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value || this.id;
    }

    private _value?: string;

    /**
     * Whether the AccordionItem is disabled.
     *
     * @defaultValue false
     * @group Props
     */
    @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
        this._disabled = value;
    }

    get disabled(): boolean {
        return this.accordion.disabled ?? this._disabled;
    }

    private _disabled = false;

    /**
     * Event emitted every time the AccordionItem is closed.
     */
    @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();

    /** Event emitted every time the AccordionItem is opened. */
    @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Event emitted when the AccordionItem is destroyed.
     * @ignore
     */
    readonly destroyed: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Emits whenever the expanded state of the accordion changes.
     * Primarily used to facilitate two-way binding.
     * @group Emits
     */
    @Output() readonly expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** Unregister function for expansionDispatcher. */
    private removeUniqueSelectionListener: () => void;

    /** Subscription to openAll/closeAll events. */
    private openCloseAllSubscription = Subscription.EMPTY;

    constructor() {
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

    focus(): void {
        this.trigger.focus();
    }

    /** Toggles the expanded state of the accordion item. */
    toggle(): void {
        if (!this.disabled) {
            this.content.onToggle();

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
