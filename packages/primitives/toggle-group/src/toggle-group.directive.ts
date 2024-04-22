import {
    AfterContentInit,
    booleanAttribute,
    ContentChildren,
    Directive,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    QueryList,
    SimpleChanges
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import {
    injectRovingFocusGroup,
    RdxRovingFocusGroupDirective
} from '@radix-ng/primitives/roving-focus';

import type { RdxToggleGroupButtonDirective } from './toggle-group-button.directive';
import { RdxToggleGroupButtonToken } from './toggle-group-button.token';
import { RdxToggleGroupToken } from './toggle-group.token';

@Directive({
    selector: '[rdxToggleGroup]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxRovingFocusGroupDirective,
            inputs: ['rdxRovingFocusGroupWrap:wrap', 'rdxRovingFocusGroupOrientation:orientation']
        }
    ],
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
export class RdxToggleGroupDirective
    implements OnInit, OnChanges, AfterContentInit, ControlValueAccessor
{
    /**
     * Access the roving focus group
     */
    private readonly rovingFocusGroup = injectRovingFocusGroup();

    /**
     * The selected toggle button.
     */
    @Input('rdxToggleGroupValue') value: string | null = null;

    /**
     * The orientation of the toggle group.
     * @default 'horizontal'
     */
    @Input('rdxToggleGroupOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

    /**
     * Whether the toggle group is disabled.
     * @default false
     */
    @Input({ alias: 'rdxToggleGroupDisabled', transform: booleanAttribute }) disabled = false;

    /**
     * Whether the toggle group roving focus should wrap.
     * @default true
     */
    @Input({ alias: 'rdxToggleGroupWrap', transform: booleanAttribute }) wrap = true;

    /**
     * Event emitted when the selected toggle button changes.
     */
    @Input('rdxToggleGroupValueChange') readonly valueChange = new EventEmitter<string | null>();

    /**
     * Access the buttons in the toggle group.
     */
    @ContentChildren(RdxToggleGroupButtonToken)
    protected buttons?: QueryList<RdxToggleGroupButtonDirective>;

    /**
     * The value change callback.
     */
    private onChange?: (value: string | null) => void;

    /**
     * The touched callback.
     */
    protected onTouched?: () => void;

    ngOnInit(): void {
        // the toggle button group has a default orientation of horizontal
        // whereas the roving focus group has a default orientation of vertical
        // if the toggle button group input is not defined, the orientation will not be set
        // in the roving focus group and the default vertical orientation will be used.
        // we must initially set the orientation of the roving focus group to match the toggle button group orientation
        this.rovingFocusGroup.setOrientation(this.orientation);
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
