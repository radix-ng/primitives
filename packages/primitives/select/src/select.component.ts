import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkConnectedOverlay, ConnectedPosition, Overlay, OverlayModule } from '@angular/cdk/overlay';
import {
    AfterContentInit,
    booleanAttribute,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    contentChildren,
    DestroyRef,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    NgZone,
    OnInit,
    Output,
    signal,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, delay, merge, Observable, Subscription, switchMap, take } from 'rxjs';
import { RdxSelectContentDirective } from './select-content.directive';
import { RdxSelectItemChange, RdxSelectItemDirective } from './select-item.directive';
import { RdxSelectTriggerDirective } from './select-trigger.directive';

let nextId = 0;

@Component({
    selector: '[rdxSelect]',
    template: `
        <ng-content select="[rdxSelectTrigger]" />

        <ng-template
            [cdkConnectedOverlayOpen]="open"
            [cdkConnectedOverlayOrigin]="elementRef"
            [cdkConnectedOverlayPositions]="positions"
            [cdkConnectedOverlayScrollStrategy]="overlay.scrollStrategies.reposition()"
            [cdkConnectedOverlayWidth]="triggerWidth() > 0 ? triggerWidth() : 'auto'"
            (attach)="onAttached()"
            (backdropClick)="close()"
            (detach)="onDetach()"
            cdkConnectedOverlayLockPosition
            cdkConnectedOverlayHasBackdrop
            cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
            cdkConnectedOverlay
        >
            <ng-content select="[rdxSelectContent]" />
        </ng-template>
    `,
    host: {
        '[style.--radix-select-trigger-width.px]': 'triggerSize()[0]',
        '[style.--radix-select-trigger-height.px]': 'triggerSize()[1]',
        '(click)': 'toggle()',
        '(keydown)': 'content().keyManager.onKeydown($event)'
    },
    imports: [
        OverlayModule
    ]
})
export class RdxSelectComponent implements OnInit, AfterContentInit {
    protected overlay = inject(Overlay);
    protected elementRef = inject(ElementRef);
    protected changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);
    private readonly ngZone = inject(NgZone);

    protected readonly trigger = contentChild.required(RdxSelectTriggerDirective);
    protected readonly content = contentChild.required<RdxSelectContentDirective>(
        forwardRef(() => RdxSelectContentDirective)
    );
    readonly items = contentChildren<RdxSelectItemDirective>(
        forwardRef(() => RdxSelectItemDirective),
        { descendants: true }
    );
    readonly overlayDir = viewChild.required(CdkConnectedOverlay);

    /**
     * Tuple type for the trigger element size. Set by the trigger element itself.
     * The first element is the width and the second element is the height.
     * @returns The size of the trigger element.
     */
    readonly triggerSize = signal<[number, number]>([0, 0]);

    /**
     * The width of the trigger element.
     * @returns The width of the trigger element.
     */
    readonly triggerWidth = computed<number>(() => this.triggerSize()[0]);

    /** Deals with the selection logic. */
    selectionModel: SelectionModel<RdxSelectItemDirective>;

    /**
     * This position config ensures that the top "start" corner of the overlay
     * is aligned with the top "start" of the origin by default (overlapping
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
    readonly dir = inject(Directionality, { optional: true });

    /**
     * @ignore
     */
    protected keyManager: ActiveDescendantKeyManager<RdxSelectItemDirective>;

    /**
     * @ignore
     */
    readonly id: string = `rdx-select-${nextId++}`;

    @Input() defaultValue: string;
    @Input() name: string;

    @Input({ transform: booleanAttribute }) defaultOpen: boolean;

    @Input({ transform: booleanAttribute }) open: boolean = false;

    /** Whether the Select is disabled. */
    @Input({ transform: booleanAttribute }) disabled: boolean;

    @Input({ transform: booleanAttribute }) required: boolean;

    /**
     * The controlled value of the item to expand
     */
    @Input()
    set value(value: string) {
        if (this._value !== value) {
            this._value = value;

            this.selectValue(value);

            this.changeDetectorRef.markForCheck();
        }
    }

    get value(): string | null {
        return this._value ?? this.defaultValue;
    }

    private _value?: string;

    @Output() readonly onValueChange: EventEmitter<string> = new EventEmitter<string>();

    @Output() readonly onOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    readonly optionSelectionChanges: Observable<RdxSelectItemChange> = defer(() => {
        const content = this.content();
        if (content.options) {
            return merge(...content.options.map((option) => option.onSelectionChange));
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
        this.selectionModel = new SelectionModel<RdxSelectItemDirective>();

        this.selectionModel.changed.subscribe((changes) => {
            if (changes.added.length) {
                this.onValueChange.emit(this.selectionModel.selected[0].value);
            }

            if (changes.removed.length) {
                changes.removed.forEach((item) => (item.selected = false));
            }
        });
    }

    ngAfterContentInit() {
        this.selectDefaultValue();

        this.optionSelectionChanges.subscribe((event) => {
            this.selectionModel.clear();

            this.selectionModel.select(event.source);

            this.close();
            this.trigger().focus();
        });

        this.content().keyManager.tabOut.subscribe(() => {
            if (this.open) this.close();
        });

        if (this.defaultOpen) {
            this.openPanel();
        }
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

        this.onOpenChange.emit(this.open);
    }

    close() {
        this.open = false;

        this.onOpenChange.emit(this.open);
    }

    updateActiveItem(item: RdxSelectItemDirective) {
        this.content().keyManager.updateActiveItem(item);
    }

    private selectDefaultValue(): void {
        if (!this.defaultValue) return;

        this.selectValue(this.defaultValue);
    }

    private selectValue(value: string): void {
        const option = this.content()?.options.find((option) => option.value === value);

        if (option) {
            option.selected = true;
            option.highlighted = true;

            this.selectionModel.select(option);
            this.updateActiveItem(option);
        }
    }

    private closingActions() {
        return merge(this.overlayDir().overlayRef!.outsidePointerEvents(), this.overlayDir().overlayRef!.detachments());
    }
}
