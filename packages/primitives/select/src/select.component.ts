import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, ConnectedPosition, Overlay, OverlayModule } from '@angular/cdk/overlay';
import {
    AfterContentInit,
    booleanAttribute,
    Component,
    ContentChild,
    ContentChildren,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    OnInit,
    Output,
    QueryList,
    ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, delay, merge, Observable, Subscription, switchMap, take } from 'rxjs';
import { RdxSelectContentDirective } from './select-content.directive';
import { RdxSelectItemChange, RdxSelectItemDirective } from './select-item.directive';
import { RdxSelectTriggerDirective } from './select-trigger.directive';

let nextId = 0;

@Component({
    standalone: true,
    selector: '[rdxSelect]',
    template: `
        <ng-content select="[rdxSelectTrigger]" />

        <ng-template
            [cdkConnectedOverlayOpen]="open"
            [cdkConnectedOverlayOrigin]="elementRef"
            [cdkConnectedOverlayPositions]="positions"
            [cdkConnectedOverlayScrollStrategy]="overlay.scrollStrategies.reposition()"
            (attach)="onAttached()"
            (backdropClick)="close()"
            (detach)="onDetach()"
            cdkConnectedOverlay
        >
            <div #panel>
                <ng-content select="[rdxSelectContent]" />
            </div>
        </ng-template>
    `,
    host: {
        '(click)': 'toggle()',
        '(keydown)': 'content.keyManager.onKeydown($event)'
    },
    imports: [
        OverlayModule
    ]
})
export class RdxSelectComponent implements OnInit, AfterContentInit {
    protected overlay = inject(Overlay);
    protected elementRef = inject(ElementRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly ngZone = inject(NgZone);

    @ContentChild(RdxSelectTriggerDirective) protected trigger: RdxSelectTriggerDirective;

    @ContentChild(RdxSelectContentDirective) protected content: RdxSelectContentDirective;

    @ContentChildren(RdxSelectItemDirective, { descendants: true }) items: QueryList<RdxSelectItemDirective>;

    @ViewChild(CdkConnectedOverlay, { static: false }) overlayDir: CdkConnectedOverlay;

    /** Deals with the selection logic. */
    selectionModel: SelectionModel<RdxSelectItemDirective>;

    /**
     * This position config ensures that the top "start" corner of the overlay
     * is aligned with with the top "start" of the origin by default (overlapping
     * the trigger completely). If the panel cannot fit below the trigger, it
     * will fall back to a position above the trigger.
     */
    positions: ConnectedPosition[] = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
        },
        {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
        }
    ];

    private closeSubscription = Subscription.EMPTY;

    /**
     * @ignore
     */
    protected readonly dir = inject(Directionality, { optional: true });

    /**
     * @ignore
     */
    protected keyManager: ActiveDescendantKeyManager<RdxSelectItemDirective>;

    /**
     * @ignore
     */
    readonly id: string = `rdx-select-${nextId++}`;

    /**
     * The value of the item to expand when initially rendered and type is "single". Use when you do not need to control the state of the items.
     */
    @Input() defaultValue: string;
    @Input() name: string;

    @Input({ transform: booleanAttribute }) defaultOpen: boolean;

    @Input({ transform: booleanAttribute }) open: boolean;

    /** Whether the Select is disabled. */
    @Input({ transform: booleanAttribute }) disabled: boolean;

    @Input({ transform: booleanAttribute }) required: boolean;

    /**
     * The controlled value of the item to expand
     */
    @Input()
    set value(value: string) {}

    get value(): string[] | string {
        if (this._value === undefined) {
            return this.defaultValue;
        }

        return this._value;
    }

    private _value?: string[];

    @Output() readonly onValueChange: EventEmitter<void> = new EventEmitter<void>();

    @Output() readonly onOpenChange: EventEmitter<void> = new EventEmitter<void>();

    readonly optionSelectionChanges: Observable<RdxSelectItemChange> = defer(() => {
        if (this.content.options) {
            return merge(...this.content.options.map((option) => option.onSelectionChange));
        }

        return this.ngZone.onStable.asObservable().pipe(
            take(1),
            switchMap(() => this.optionSelectionChanges)
        );
    }) as Observable<RdxSelectItemChange>;

    get selected(): string | null {
        return this.selectionModel.selected[0].viewValue || null;
    }

    ngOnInit() {
        this.selectionModel = new SelectionModel();
    }

    ngAfterContentInit() {
        this.optionSelectionChanges.subscribe((event) => {
            this.selectionModel.clear();

            this.selectionModel.select(event.source);

            this.close();
            this.trigger.focus();
        });

        this.content.keyManager.tabOut.subscribe(() => {
            if (this.open) this.close();
        });
    }

    /**
     * Callback that is invoked when the overlay panel has been attached.
     */
    onAttached(): void {
        this.closeSubscription = this.closingActions()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .pipe(delay(0))
            .subscribe(() => this.close());
    }

    onDetach() {
        this.close();
        this.closeSubscription.unsubscribe();
    }

    /** Toggles the overlay panel open or closed. */
    toggle(): void {
        if (this.open) {
            this.close();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        this.open = true;
    }

    close() {
        this.open = false;
    }

    updateActiveItem(item: RdxSelectItemDirective) {
        this.content.keyManager.updateActiveItem(item);
    }

    private closingActions() {
        return merge(this.overlayDir.overlayRef!.outsidePointerEvents(), this.overlayDir.overlayRef!.detachments());
    }
}
