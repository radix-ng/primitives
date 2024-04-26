import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Self
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';

import { RdxFormFieldControl } from '../../form-field';
import { RdxTextareaBase } from './textarea-base';
import { RDX_TEXTAREA_VALUE_ACCESSOR } from './textarea.token';

let nextUniqueId = 0;

@Directive({
    selector: 'textarea[rdxTextarea]',
    exportAs: 'rdxTextarea',
    standalone: true,
    host: {
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[attr.disabled]': 'disabled || null',
        '[attr.required]': 'required',

        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)'
    },
    providers: [{ provide: RdxFormFieldControl, useExisting: RdxTextareaDirective }]
})
export class RdxTextareaDirective
    extends RdxTextareaBase
    implements RdxFormFieldControl<any>, OnInit, OnChanges, OnDestroy, DoCheck
{
    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    focused = false;

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    override readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    controlType = 'textarea';

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string | undefined;

    private _disabled = false;

    private _required = false;

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
    }

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    @Input()
    get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }

        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        if (this.focused) {
            this.focused = false;
            this.stateChanges.next();
        }
    }

    private valueAccessor: { value: any };

    @Input()
    get value(): string {
        return this.valueAccessor.value;
    }

    set value(value: string) {
        if (value !== this.value) {
            this.valueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    protected uid = `rdx-textarea-${nextUniqueId++}`;
    private _id = '';
    protected previousNativeValue: any;

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
    }

    constructor(
        protected elementRef: ElementRef,
        @Optional() @Self() ngControl: NgControl,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        @Optional() @Self() @Inject(RDX_TEXTAREA_VALUE_ACCESSOR) inputValueAccessor: any
    ) {
        super(parentForm, parentFormGroup, ngControl);

        // If no input value accessor was explicitly specified, use the element as the textarea value
        // accessor.
        this.valueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;
    }

    ngOnInit() {
        this.setBaseStyles();
    }

    private setBaseStyles() {
        const baseStyles = {
            '-webkit-appearance': 'none', // Chrome textarea height sizing fix
            'vertical-align': 'bottom',
            'box-sizing': 'border-box',
            'overflow-y': 'hidden'
        };

        Object.assign(this.elementRef.nativeElement.style, baseStyles);
    }

    ngOnChanges() {
        this.stateChanges.next();
    }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            // TODO
        }

        // We need to dirty-check the native element's value, because there are some cases where
        // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
        // updating the value using `emitEvent: false`).
        this.dirtyCheckNativeValue();
    }

    onBlur(): void {
        this.focusChanged(false);

        if (this.ngControl?.control) {
            const control = this.ngControl.control;

            control.updateValueAndValidity({ emitEvent: false });
            (control.statusChanges as EventEmitter<string>).emit(control.status);
        }
    }

    /** Focuses the textarea. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    /** Callback for the cases where the focused state of the textarea changes. */
    focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this.elementRef.nativeElement.value && !this.isBadInput();
    }

    /**
     * Implemented as part of FormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /** Does some manual dirty checking on the native textarea `value` property. */
    protected dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this.previousNativeValue !== newValue) {
            this.previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Checks whether the textarea is invalid based on the native validation. */
    protected isBadInput(): boolean {
        // The `validity` property won't be present on platform-server.
        const validity = (this.elementRef.nativeElement as HTMLTextAreaElement).validity;

        return validity && validity.badInput;
    }
}
