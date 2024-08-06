import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { AfterContentInit, Directive, inject, Input, OnDestroy } from '@angular/core';
import { RdxDropdownMenuItemDirective } from './dropdown-menu-item.directive';
import { RdxDropdownMenuItemRadioGroupDirective } from './dropdown-menu-item-radio-group.directive';
import { RdxDropdownMenuSelectable } from './dropdown-menu-item-selectable';


/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;

@Directive({
    selector: '[rdxDropdownMenuItemRadio]',
    standalone: true,
    host: {
        'role': 'menuitemradio'
    },
    providers: [
        { provide: RdxDropdownMenuSelectable, useExisting: RdxDropdownMenuItemRadioDirective },
        { provide: RdxDropdownMenuItemDirective, useExisting: RdxDropdownMenuSelectable }
    ]
})
export class RdxDropdownMenuItemRadioDirective extends RdxDropdownMenuSelectable
    implements AfterContentInit, OnDestroy {

    /** The unique selection dispatcher for this radio's `RdxDropdownMenuItemRadioGroupDirective`. */
    private readonly selectionDispatcher = inject(UniqueSelectionDispatcher);

    private readonly group = inject(RdxDropdownMenuItemRadioGroupDirective);

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

        this.cdkMenuItem.triggered.subscribe(() => {
            if (!this.cdkMenuItem.disabled) {
                this.selectionDispatcher.notify(this.value, '');

                this.group.valueChange.emit(this.value);
            }
        })
    }

    ngAfterContentInit() {
        this.removeDispatcherListener = this.selectionDispatcher.listen((id: string) => {
            this.checked = this.value === id;
        });
    }

    ngOnDestroy() {
        this.removeDispatcherListener();
    }
}

