import {
    AfterContentInit,
    booleanAttribute,
    ContentChildren,
    Directive,
    Input,
    OnChanges,
    output,
    QueryList,
    SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import type { RdxToggleGroupItemDirective } from './toggle-group-item.directive';
import { RdxToggleGroupItemToken } from './toggle-group-item.token';
import { RdxToggleGroupToken } from './toggle-group.token';

let nextId = 0;

@Directive({
    selector: '[rdxToggleGroup]',
    exportAs: 'rdxToggleGroup',
    standalone: true,
    providers: [
        { provide: RdxToggleGroupToken, useExisting: RdxToggleGroupDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxToggleGroupDirective, multi: true }
    ],
    hostDirectives: [{ directive: RdxRovingFocusGroupDirective, inputs: ['dir', 'orientation', 'loop'] }],
    host: {
        role: 'group',
        '[attr.data-orientation]': 'orientation',

        '(focusout)': 'onTouched?.()'
    }
})
export class RdxToggleGroupDirective implements OnChanges, AfterContentInit, ControlValueAccessor {
    readonly id: string = `rdx-toggle-group-${nextId++}`;

    @Input()
    set defaultValue(value: string[] | string) {
        if (value !== this._defaultValue) {
            this._defaultValue = Array.isArray(value) ? value : [value];
        }
    }

    get defaultValue(): string[] | string {
        return this.isMultiple ? this._defaultValue : this._defaultValue[0];
    }

    /**
     * The selected toggle button.
     */
    @Input()
    set value(value: string[] | string) {
        if (value !== this._value) {
            this._value = Array.isArray(value) ? value : [value];
        }
    }

    get value(): string[] | string {
        if (this._value === undefined) {
            return this.defaultValue;
        }

        return this.isMultiple ? this._value : this._value[0];
    }

    @Input() type: 'single' | 'multiple' = 'single';

    /**
     * The orientation of the toggle group.
     * @default 'horizontal'
     */
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

    /**
     * Whether the toggle group is disabled.
     * @default false
     */
    @Input({ transform: booleanAttribute }) disabled = false;

    /**
     * Event emitted when the selected toggle button changes.
     */
    readonly onValueChange = output<string[] | string | null>();

    /**
     * Access the buttons in the toggle group.
     */
    @ContentChildren(RdxToggleGroupItemToken)
    protected buttons?: QueryList<RdxToggleGroupItemDirective>;

    private _value?: string[];
    private _defaultValue: string[] | string = [];

    /**
     * The value change callback.
     */
    private onChange?: (value: string | string[] | null) => void;

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     */
    protected onTouched?: () => void;

    get isMultiple(): boolean {
        return this.type === 'multiple';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('disabled' in changes) {
            this.buttons?.forEach((button) => button.updateDisabled());
        }
    }

    ngAfterContentInit(): void {
        if (this.disabled) {
            this.buttons?.forEach((button) => button.updateDisabled());
        }
    }

    /**
     * Determine if a value is selected.
     * @param value The value to check.
     * @returns Whether the value is selected.
     * @ignore
     */
    isSelected(value: string): boolean {
        if (typeof this.value === 'string') {
            return this.value === value;
        } else if (Array.isArray(this.value)) {
            return this.value.includes(value);
        }
        return false;
    }

    /**
     * Toggle a value.
     * @param value The value to toggle.
     * @ignore
     */
    toggle(value: string): void {
        if (this.disabled) {
            return;
        }

        if (Array.isArray(this.value)) {
            const index = this.value.indexOf(value);
            if (index > -1) {
                this.value = this.value.filter((v) => v !== value);
            } else {
                this.value = [...this.value, value];
            }
        } else {
            this.value = this.value === value ? '' : value;
        }

        this.onValueChange.emit(this.value);
        this.onChange?.(this.value);
    }

    /**
     * Select a value from Angular forms.
     * @param value The value to select.
     * @ignore
     */
    writeValue(value: string): void {
        this.value = value;
    }

    /**
     * Register a callback to be called when the value changes.
     * @param fn The callback to register.
     * @ignore
     */
    registerOnChange(fn: (value: string | string[] | null) => void): void {
        this.onChange = fn;
    }

    /**
     * Register a callback to be called when the toggle group is touched.
     * @param fn The callback to register.
     * @ignore
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Set the disabled state of the toggle group.
     * @param isDisabled Whether the toggle group is disabled.
     * @ignore
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.buttons?.forEach((button) => button.updateDisabled());
    }
}
