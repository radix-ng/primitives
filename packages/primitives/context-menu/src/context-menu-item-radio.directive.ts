import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { CdkMenuItem } from '@angular/cdk/menu';
import { AfterContentInit, Directive, inject, Input, OnDestroy } from '@angular/core';
import { RdxContextMenuItemRadioGroupDirective } from './context-menu-item-radio-group.directive';
import { RdxContextMenuSelectable } from './context-menu-item-selectable';
import { RdxContextMenuItemDirective } from './context-menu-item.directive';

/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;

@Directive({
    selector: '[rdxContextMenuItemRadio]',
    standalone: true,
    host: {
        role: 'menuitemradio'
    },
    providers: [
        { provide: RdxContextMenuSelectable, useExisting: RdxContextMenuItemRadioDirective },
        { provide: RdxContextMenuItemDirective, useExisting: RdxContextMenuSelectable },
        { provide: CdkMenuItem, useExisting: RdxContextMenuItemDirective }
    ]
})
export class RdxContextMenuItemRadioDirective extends RdxContextMenuSelectable implements AfterContentInit, OnDestroy {
    /** The unique selection dispatcher for this radio's `RdxContextMenuItemRadioGroupDirective`. */
    private readonly selectionDispatcher = inject(UniqueSelectionDispatcher);

    private readonly group = inject(RdxContextMenuItemRadioGroupDirective);

    @Input()
    get value() {
        return this._value || this.id;
    }

    set value(value: string) {
        this._value = value;
    }

    private _value: string | undefined;

    /** An ID to identify this radio item to the `UniqueSelectionDispatcher`. */
    private id = `${nextId++}`;

    private removeDispatcherListener!: () => void;

    constructor() {
        super();

        this.triggered.subscribe(() => {
            if (!this.disabled) {
                this.selectionDispatcher.notify(this.value, '');

                this.group.valueChange.emit(this.value);
            }
        });
    }

    ngAfterContentInit() {
        this.removeDispatcherListener = this.selectionDispatcher.listen((id: string) => {
            this.checked = this.value === id;
        });
    }

    override ngOnDestroy() {
        super.ngOnDestroy();
        this.removeDispatcherListener();
    }
}
