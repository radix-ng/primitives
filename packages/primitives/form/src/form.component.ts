import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    EventEmitter,
    forwardRef,
    InjectionToken,
    Input,
    Output,
    Signal,
    signal
} from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface ValidityState {
    valid: boolean;
    invalid: boolean;
    pending: boolean;
    errors: Record<string, any> | null;
    touched: boolean;
    untouched: boolean;
    dirty: boolean;
    pristine: boolean;
}

export interface ValidityMatcher {
    matcher: (value: any, formGroup: FormGroup) => boolean;
    message: string;
}

export interface FormContextValue {
    formGroup: FormGroup;
    disabled: boolean;
    validationErrors: Signal<string[]>;
    validityMatchers: ValidityMatcher[];
    builtInMessages: Record<string, string>;
    isSubmitted: Signal<boolean>;
    generateId: (name: string) => string;
    getValidityState: (name: string) => ValidityState;
}

export const FORM_CONTEXT = new InjectionToken<FormContextValue>('FORM_CONTEXT');

export const DEFAULT_BUILT_IN_MESSAGES: Record<string, string> = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'This field is too short',
    maxlength: 'This field is too long',
    pattern: 'This field is invalid'
};

export const DEFAULT_INVALID_MESSAGE = 'This form is invalid';

@Component({
    selector: 'rdx-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
        <form [formGroup]="formGroup" (ngSubmit)="handleSubmit()" (reset)="handleReset()">
            <ng-content></ng-content>
        </form>
    `,
    providers: [
        {
            provide: ControlContainer,
            useExisting: FormGroupDirective
        },
        {
            provide: FORM_CONTEXT,
            useExisting: forwardRef(() => RdxFormComponent)
        }
    ]
})
export class RdxFormComponent implements FormContextValue {
    @Input() id?: string;
    @Input() formGroup!: FormGroup;

    private _disabled = signal(false);
    @Input() set disabled(value: boolean) {
        this._disabled.set(value);
    }
    isDisabled = computed(() => this._disabled());

    private _isSubmitted = signal(false);
    isSubmitted = computed(() => this._isSubmitted());

    private _validationErrors = signal<string[]>([]);
    validationErrors = computed(() => this._validationErrors());

    private _validityMatchers = signal<ValidityMatcher[]>([]);
    @Input() set validityMatchers(matchers: ValidityMatcher[]) {
        this._validityMatchers.set(matchers);
    }
    getValidityMatchers = computed(() => this._validityMatchers());

    private _builtInMessages = signal<Record<string, string>>(DEFAULT_BUILT_IN_MESSAGES);
    @Input() set builtInMessages(messages: Record<string, string>) {
        this._builtInMessages.set({ ...DEFAULT_BUILT_IN_MESSAGES, ...messages });
    }
    getBuiltInMessages = computed(() => this._builtInMessages());

    @Output() onSubmit = new EventEmitter<void>();
    @Output() onInvalid = new EventEmitter<string[]>();
    @Output() onReset = new EventEmitter<void>();

    handleSubmit() {
        this._isSubmitted.set(true);

        if (this.formGroup.valid && this.checkCustomValidity()) {
            this.onSubmit.emit();
        } else {
            const errors = [
                ...this.getFormErrors(this.formGroup),
                ...this.getCustomValidationErrors()
            ];
            this._validationErrors.set(errors);
            this.onInvalid.emit(errors);
        }
    }

    handleReset() {
        this.formGroup.reset();
        this._validationErrors.set([]);
        this._isSubmitted.set(false);
        this.onReset.emit();
    }

    generateId(name: string): string {
        return `${this.id || 'form'}-${name}`;
    }

    getValidityState(name: string): ValidityState {
        const control = this.formGroup.get(name);
        if (!control) {
            throw new Error(`Control with name "${name}" not found in form group`);
        }
        return {
            valid: control.valid,
            invalid: control.invalid,
            pending: control.pending,
            errors: control.errors,
            touched: control.touched,
            untouched: control.untouched,
            dirty: control.dirty,
            pristine: control.pristine
        };
    }

    private getFormErrors(form: FormGroup): string[] {
        const errors: string[] = [];
        Object.keys(form.controls).forEach((key) => {
            const control = form.get(key);
            if (control?.errors) {
                Object.keys(control.errors).forEach((errorKey) => {
                    const message = this.getBuiltInMessages()[errorKey] || `${key} is invalid`;
                    errors.push(message);
                });
            }
        });
        return errors;
    }

    private checkCustomValidity(): boolean {
        return this.getValidityMatchers().every((matcher) => matcher.matcher(this.formGroup.value, this.formGroup));
    }

    private getCustomValidationErrors(): string[] {
        return this.getValidityMatchers()
            .filter((matcher) => !matcher.matcher(this.formGroup.value, this.formGroup))
            .map((matcher) => matcher.message);
    }
}
