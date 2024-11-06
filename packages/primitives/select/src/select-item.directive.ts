import { Highlightable } from '@angular/cdk/a11y';
import { booleanAttribute, Directive, ElementRef, EventEmitter, inject, Input } from '@angular/core';

let nextId = 0;

export class RdxSelectItemChange<T = RdxSelectItemDirective> {
    constructor(public source: T) {}
}

@Directive({
    selector: '[rdxSelectItem]',
    standalone: true,
    exportAs: 'rdxSelectItem',
    host: {
        '[attr.data-state]': 'dataState',
        '[attr.data-disabled]': 'disabled',
        '[attr.data-highlighted]': 'highlighted',
        '(click)': 'selectViaInteraction()'
    }
})
export class RdxSelectItemDirective implements Highlightable {
    readonly onSelectionChange = new EventEmitter<RdxSelectItemChange>();
    protected elementRef = inject(ElementRef);

    get dataState(): string {
        return 'checked' || 'unchecked';
    }

    /**
     * The unique SelectItem id.
     * @ignore
     */
    readonly id: string = `rdx-select-item-${nextId++}`;

    get highlighted(): boolean | null {
        return null;
    }

    @Input()
    set value(value: string) {
        this._value = value;
    }

    get value(): string {
        return this._value || this.id;
    }

    private _value?: string;

    @Input() textValue: string | null = null;

    /** Whether the SelectItem is disabled. */
    @Input({ transform: booleanAttribute })
    set disabled(value: boolean) {
        this._disabled = value;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    private _disabled: boolean;

    selected: boolean;

    get viewValue(): string {
        return this.textValue ?? this.elementRef.nativeElement.textContent;
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        return this.value;
    }

    /**
     * `Selects the option while indicating the selection came from the user. Used to
     * determine if the select's view -> model callback should be invoked.`
     */
    selectViaInteraction(): void {
        if (!this.disabled) {
            this.selected = true;

            this.onSelectionChange.emit(new RdxSelectItemChange(this));
        }
    }

    setActiveStyles() {}
    setInactiveStyles() {}
}
