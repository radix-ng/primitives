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
import type { RdxToggleGroupButtonDirective } from './toggle-group-button.directive';
import { RdxToggleGroupButtonToken } from './toggle-group-button.token';
import { RdxToggleGroupToken } from './toggle-group.token';

@Directive({
    selector: '[rdxToggleGroupMulti]',
    standalone: true,
    providers: [
        { provide: RdxToggleGroupToken, useExisting: RdxToggleGroupMultiDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxToggleGroupMultiDirective, multi: true }
    ],
    host: {
        role: 'group',
        '[attr.data-orientation]': 'orientation',
        '(focusout)': 'onTouched?.()'
    }
})
export class RdxToggleGroupMultiDirective implements OnChanges, AfterContentInit, ControlValueAccessor {
    /**
     * The selected toggle button.
     */
    @Input('rdxToggleGroupMultiValue') value: ReadonlyArray<string> = [];

    /**
     * The orientation of the toggle group.
     * @default 'horizontal'
     */
    @Input('rdxToggleGroupMultiOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

    /**
     * Whether the toggle group is disabled.
     * @default false
     */
    @Input({ alias: 'rdxToggleGroupMultiDisabled', transform: booleanAttribute }) disabled = false;

    /**
     * Whether the toggle group roving focus should wrap.
     * @default true
     */
    @Input({ alias: 'rdxToggleGroupMultiWrap', transform: booleanAttribute }) wrap = true;

    /**
     * Event emitted when the selected toggle button changes.
     */
    @Input('rdxToggleGroupMultiValueChange') readonly valueChange = new EventEmitter<ReadonlyArray<string>>();

    /**
     * Access the buttons in the toggle group.
     * @ignore
     */
    @ContentChildren(RdxToggleGroupButtonToken)
    protected buttons?: QueryList<RdxToggleGroupButtonDirective>;

    /**
     * The value change callback.
     * @ignore
     */
    private onChange?: (value: ReadonlyArray<string>) => void;

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     * @ignore
     */
    protected onTouched?: () => void;

    /**
     * @ignore
     */
    ngOnChanges(changes: SimpleChanges): void {
        if ('disabled' in changes) {
            this.buttons?.forEach((button) => button.updateDisabled());
        }
    }

    /**
     * @ignore
     */
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
        return this.value.includes(value);
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

        this.value = this.value.includes(value) ? this.value.filter((v) => v !== value) : [...this.value, value];

        this.valueChange.emit(this.value);
        this.onChange?.(this.value);
    }

    /**
     * Select a value from Angular forms.
     * @param value The value to select.
     * @ignore
     */
    writeValue(value: ReadonlyArray<string>): void {
        this.value = value;
    }

    /**
     * Register a callback to be called when the value changes.
     * @param fn The callback to register.
     * @ignore
     */
    registerOnChange(fn: (value: ReadonlyArray<string>) => void): void {
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
