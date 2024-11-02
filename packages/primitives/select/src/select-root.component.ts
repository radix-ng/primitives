import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { ConnectedPosition, Overlay, OverlayModule } from '@angular/cdk/overlay';
import {
    booleanAttribute,
    Component,
    ContentChildren,
    EventEmitter,
    inject,
    Input,
    Output,
    QueryList
} from '@angular/core';
import { Subject } from 'rxjs';
import { RdxSelectItemDirective } from './select-item.directive';

let nextId = 0;

@Component({
    standalone: true,
    selector: '[rdxSelectRoot]',
    template: `
        <div
            #origin="cdkOverlayOrigin"
            cdk-overlay-origin>
            <ng-content select="[rdxSelectTrigger]"></ng-content>
        </div>

        <ng-template
            [cdkConnectedOverlayMinWidth]="triggerRect?.width!"
            [cdkConnectedOverlayOpen]="open"
            [cdkConnectedOverlayOrigin]="origin"
            [cdkConnectedOverlayPositions]="positions"
            [cdkConnectedOverlayScrollStrategy]="overlay.scrollStrategies.reposition()"
            (attach)="onAttached()"
            (backdropClick)="close()"
            (detach)="close()"
            cdk-connected-overlay
            cdkConnectedOverlayLockPosition
        >
            <div
                #panel
                (click)="handleClick($event)"
                (keydown)="handleKeydown($event)"
            >
                <ng-content select="[rdxSelectContent]"></ng-content>
            </div>
        </ng-template>
    `,
    host: {
        '(click)': 'toggle()',
        '(keydown)': 'handleKeydown($event)'
    },
    imports: [
        OverlayModule
    ]
})
export class RdxSelectRootComponent {
    protected overlay = inject(Overlay);
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

    /**
     * @ignore
     */
    protected readonly dir = inject(Directionality, { optional: true });

    /**
     * @ignore
     */
    protected keyManager: FocusKeyManager<RdxSelectItemDirective>;

    /**
     * @ignore
     */
    readonly id: string = `rdx-select-${nextId++}`;

    /**
     * @ignore
     */
    readonly openCloseAllActions = new Subject<boolean>();

    /**
     * @private
     * @ignore
     */
    @ContentChildren(RdxSelectItemDirective, { descendants: true }) items: QueryList<RdxSelectItemDirective>;

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

    /**
     * @ignore
     */
    handleKeydown(event: KeyboardEvent) {}

    onAttached() {

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

        console.log('open: ');
    }

    close() {
        console.log('close: ');

        this.open = false;
    }

    handleClick($event: MouseEvent) {

    }
}
