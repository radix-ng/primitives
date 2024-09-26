import {
    AfterContentInit,
    booleanAttribute,
    ContentChildren,
    Directive,
    EventEmitter,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { RdxToggleGroupItemDirective } from './toggle-group-item.directive';
import { RdxToggleGroupItemToken } from './toggle-group-item.token';
import { RdxToggleGroupToken } from './toggle-group.token';

@Directive({
    selector: '[rdxToggleGroup]',
    standalone: true,
    providers: [
        { provide: RdxToggleGroupToken, useExisting: RdxToggleGroupDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxToggleGroupDirective, multi: true }
    ],
    host: {
        role: 'group',
        '[attr.data-orientation]': 'orientation',
        '(focusout)': 'onTouched?.()'
    }
})
export class RdxToggleGroupDirective implements OnChanges, AfterContentInit, ControlValueAccessor {
    /**
     * The selected toggle button.
     */
    @Input() value: string | null = null;

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
     * Whether the toggle group roving focus should wrap.
     * @default true
     */
    @Input({ transform: booleanAttribute }) wrap = true;

    /**
     * Event emitted when the selected toggle button changes.
     */
    @Input() readonly valueChange = new EventEmitter<string | null>();

    /**
     * Access the buttons in the toggle group.
     */
    @ContentChildren(RdxToggleGroupItemToken)
    protected buttons?: QueryList<RdxToggleGroupItemDirective>;

    /**
     * The value change callback.
     */
    private onChange?: (value: string | null) => void;

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     */
    protected onTouched?: () => void;

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
     * @internal
     */
    isSelected(value: string): boolean {
        return this.value === value;
    }

    /**
     * Toggle a value.
     * @param value The value to toggle.
     * @internal
     */
    toggle(value: string): void {
        if (this.disabled) {
            return;
        }

        this.value = this.value === value ? null : value;
        this.valueChange.emit(this.value);
        this.onChange?.(this.value);
    }

    /**
     * Select a value from Angular forms.
     * @param value The value to select.
     * @internal
     */
    writeValue(value: string): void {
        this.value = value;
    }

    /**
     * Register a callback to be called when the value changes.
     * @param fn The callback to register.
     * @internal
     */
    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    /**
     * Register a callback to be called when the toggle group is touched.
     * @param fn The callback to register.
     * @internal
     */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Set the disabled state of the toggle group.
     * @param isDisabled Whether the toggle group is disabled.
     * @internal
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.buttons?.forEach((button) => button.updateDisabled());
    }
}
