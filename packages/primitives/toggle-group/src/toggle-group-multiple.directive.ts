import { FocusKeyManager } from '@angular/cdk/a11y';
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
    selector: '[rdxToggleGroupMultiple]',
    exportAs: 'rdxToggleGroupMultiple',
    standalone: true,
    providers: [
        { provide: RdxToggleGroupToken, useExisting: RdxToggleGroupMultipleDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxToggleGroupMultipleDirective, multi: true }
    ],
    host: {
        role: 'group',
        '[attr.data-orientation]': 'orientation',

        '(keydown)': 'handleKeydown($event)',
        '(focusin)': 'onFocusIn()',
        '(focusout)': 'onTouched?.()'
    }
})
export class RdxToggleGroupMultipleDirective implements OnChanges, AfterContentInit, ControlValueAccessor {
    /**
     * The selected toggle button.
     */
    @Input() value: ReadonlyArray<string> = [];

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
    @Input() readonly valueChange = new EventEmitter<ReadonlyArray<string>>();

    /**
     * Access the buttons in the toggle group.
     * @ignore
     */
    @ContentChildren(RdxToggleGroupItemToken)
    protected buttons?: QueryList<RdxToggleGroupItemDirective>;

    /**
     * FocusKeyManager to manage keyboard interactions.
     */
    private keyManager!: FocusKeyManager<RdxToggleGroupItemDirective>;

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

        if (this.buttons) {
            this.keyManager = new FocusKeyManager(this.buttons).withWrap();
        }
    }

    protected onFocusIn(): void {
        if (!this.keyManager.activeItem) {
            this.keyManager.setFirstItemActive();
        }
    }

    protected handleKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                this.keyManager.setNextItemActive();
                event.preventDefault();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                this.keyManager.setPreviousItemActive();
                event.preventDefault();
                break;
            case 'Home':
                this.keyManager.setFirstItemActive();
                event.preventDefault();
                break;
            case 'End':
                this.keyManager.setLastItemActive();
                event.preventDefault();
                break;
            case 'Enter':
            case ' ':
                // eslint-disable-next-line no-case-declarations
                const activeItem = this.keyManager.activeItem;
                if (activeItem) {
                    activeItem.toggle();
                }
                event.preventDefault();
                break;
            default:
                break;
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
