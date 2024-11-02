import { booleanAttribute, Directive, Input } from '@angular/core';

let nextId = 0;

@Directive({
    selector: '[rdxSelectItem]',
    standalone: true,
    exportAs: 'rdxSelectItem',
    host: {
        '[attr.data-state]': 'dataState',
        '[attr.data-disabled]': 'disabled',
        '[attr.data-highlighted]': 'highlighted'
    }
})
export class RdxSelectItemDirective {
    get dataState(): string {
        return 'checked' || 'unchecked';
    }

    /**
     * The unique SelectItem id.
     * @ignore
     */
    readonly id: string = `rdx-select-item-${nextId++}`;

    get highlighted(): boolean {
        return false;
    }

    @Input()
    set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value || this.id;
    }

    private _value?: string;

    @Input() textValue: string = '';

    /** Whether the SelectItem is disabled. */
    @Input({ transform: booleanAttribute })
    set disabled(value: boolean) {
        this._disabled = value;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    private _disabled = false;
}
