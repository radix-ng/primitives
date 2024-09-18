import { FocusKeyManager } from '@angular/cdk/a11y';
import { DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    booleanAttribute,
    ContentChildren,
    Directive,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    QueryList
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RdxRadioItemDirective } from './radio-item.directive';
import { RadioGroupDirective, RadioGroupProps, RDX_RADIO_GROUP } from './radio-tokens';

@Directive({
    selector: '[rdxRadioRoot]',
    exportAs: 'rdxRadioRoot',
    standalone: true,
    providers: [
        { provide: RDX_RADIO_GROUP, useExisting: RdxRadioGroupDirective },
        { provide: NG_VALUE_ACCESSOR, useExisting: RdxRadioGroupDirective, multi: true }
    ],
    host: {
        role: 'radiogroup',
        '[attr.aria-orientation]': '_orientation',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.tabindex]': '-1',
        '[attr.dir]': 'dir',
        '(keydown)': '_onKeydown($event)',
        '(focusin)': '_onFocusin($event)'
    }
})
export class RdxRadioGroupDirective
    implements RadioGroupProps, RadioGroupDirective, ControlValueAccessor, AfterContentInit, OnDestroy
{
    @ContentChildren(RdxRadioItemDirective, { descendants: true }) radioItems!: QueryList<RdxRadioItemDirective>;
    private focusKeyManager!: FocusKeyManager<RdxRadioItemDirective>;
    private destroy$ = new Subject<void>();

    name?: string | undefined;
    @Input() value?: string;

    @Input({ transform: booleanAttribute }) disabled = false;

    @Input() dir?: string;

    @Input() defaultValue?: string;

    /**
     * The orientation of the radio group only vertical.
     * Horizontal radio buttons can sometimes be challenging to scan and localize.
     * The horizontal arrangement of radio buttons may also lead to difficulties in determining which
     * label corresponds to which button: whether the label is above or below the button.
     * @default 'vertical'
     */
    readonly _orientation = 'vertical';

    /**
     * Event handler called when the value changes.
     */
    @Output() readonly onValueChange = new EventEmitter<string>();

    /**
     * The callback function to call when the value of the radio group changes.
     */
    private onChange: (value: string) => void = () => {
        /* Empty */
    };

    /**
     * The callback function to call when the radio group is touched.
     */
    onTouched: () => void = () => {
        /* Empty */
    };

    ngAfterContentInit() {
        this.focusKeyManager = new FocusKeyManager(this.radioItems).withWrap().withVerticalOrientation();

        this.radioItems.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.updateActiveItem();
        });

        this.updateActiveItem(false);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Select a radio item.
     * @param value The value of the radio item to select.
     */
    select(value: string): void {
        this.value = value;
        this.onValueChange.emit(value);
        this.onChange?.(value);
        this.updateActiveItem();
        this.onTouched();
    }

    /**
     * Update the value of the radio group.
     * @param value The new value of the radio group.
     * @internal
     */
    writeValue(value: string): void {
        this.value = value;
        if (this.radioItems) {
            this.updateActiveItem(false);
        }
    }

    /**
     * Register a callback function to call when the value of the radio group changes.
     * @param fn The callback function to call when the value of the radio group changes.
     * @internal
     */
    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /**
     * Set the disabled state of the radio group.
     * @param isDisabled Whether the radio group is disabled.
     * @internal
     */
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /**
     * When focus leaves the radio group.
     */
    _onFocusin(event: FocusEvent): void {
        const target = event.target as HTMLElement;
        const radioItem = this.radioItems.find((item) => item.element.nativeElement === target);
        if (radioItem) {
            this.focusKeyManager.setActiveItem(radioItem);
        }
    }

    _onKeydown(event: KeyboardEvent): void {
        if (this.disabled) return;

        switch (event.keyCode) {
            case ENTER:
            case SPACE:
                event.preventDefault();
                this.selectFocusedItem();
                break;
            case DOWN_ARROW:
            case RIGHT_ARROW:
                event.preventDefault();
                this.focusKeyManager.setNextItemActive();
                this.selectFocusedItem();
                break;
            case UP_ARROW:
            case LEFT_ARROW:
                event.preventDefault();
                this.focusKeyManager.setPreviousItemActive();
                this.selectFocusedItem();
                break;
            case TAB:
                this.tabNavigation(event);
                break;
            default:
                this.focusKeyManager.onKeydown(event);
        }
    }

    private selectFocusedItem(): void {
        const focusedItem = this.focusKeyManager.activeItem;
        if (focusedItem) {
            this.select(focusedItem.value);
        }
    }

    private updateActiveItem(setFocus = true): void {
        const activeItem = this.radioItems.find((item) => item.value === this.value);
        if (activeItem) {
            this.focusKeyManager.setActiveItem(activeItem);
        } else if (this.radioItems.length > 0 && setFocus) {
            this.focusKeyManager.setFirstItemActive();
        }
    }

    private tabNavigation(event: KeyboardEvent): void {
        event.preventDefault();
        const checkedItem = this.radioItems.find((item) => item.checked);
        if (checkedItem) {
            checkedItem.focus();
        } else if (this.radioItems.first) {
            this.radioItems.first.focus();
        }
    }
}
