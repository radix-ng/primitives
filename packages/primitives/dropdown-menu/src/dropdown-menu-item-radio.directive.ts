import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, inject, Input } from '@angular/core';
import { RdxDropdownMenuItemDirective } from '@radix-ng/primitives/dropdown-menu';
import { an } from 'vitest/dist/reporters-xEmem8D4';
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
export class RdxDropdownMenuItemRadioDirective extends RdxDropdownMenuSelectable {
    @Input()
    get value() {
        return this._value || this.id;
    }

    set value(value: string) {
        this._value = value;
    }

    private _value: string | undefined;

    /** The unique selection dispatcher for this radio's `CdkMenuGroup`. */
    private readonly selectionDispatcher = inject(UniqueSelectionDispatcher);

    private readonly group = inject(RdxDropdownMenuItemRadioGroupDirective);

    /** An ID to identify this radio item to the `UniqueSelectionDispatcher`. */
    private id = `${nextId++}`;

    /** Function to unregister the selection dispatcher */
    private removeDispatcherListener: () => void;

    constructor() {
        super();

        this.removeDispatcherListener = this.selectionDispatcher.listen((id: string) => {
            this.checked = this.value === id;
        });
    }

    override ngOnDestroy() {
        super.ngOnDestroy();

        this.removeDispatcherListener();
    }

    /**
     * Toggles the checked state of the radio-button.
     * @param options Options the configure how the item is triggered
     *   - keepOpen: specifies that the menu should be kept open after triggering the item.
     */
    override trigger(options?: { keepOpen: boolean }) {
        super.trigger(options);

        if (!this.disabled) {
            this.selectionDispatcher.notify(this.value, '');

            this.group.onValueChange.emit(this.value);
        }
    }
}

