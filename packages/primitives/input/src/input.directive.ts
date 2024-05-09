import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    inject,
    Input,
    Renderer2
} from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { injectNgControl } from '../../core';

const validationAttributes = [
    'required',
    'pattern',
    'minlength',
    'maxlength',
    'min',
    'max',
    'step'
];

export enum InputState {
    NONE,
    VALID,
    INVALID
}

@Directive({
    selector: '[InputRoot]',
    exportAs: 'rdxInput',
    standalone: true,
    host: {
        '[attr.disabled]': 'disabled ? disabled : null',
        '(blur)': 'onBlur()',
        '(change)': 'onChange($event)',
        '(input)': 'onInput()',
        '(focus)': 'onFocus()'
    }
})
export class RdxInputDirective implements AfterViewInit {
    #elementRef = inject(ElementRef<HTMLInputElement>);
    #ngControl = injectNgControl({ optional: true });
    #renderer = inject(Renderer2);
    #changeDetectorRef = inject(ChangeDetectorRef);

    @Input({ transform: booleanAttribute }) disabled = false;

    @Input()
    public set value(value: never) {
        this.#elementRef.nativeElement.value = value ?? '';
        this.updateValidation();
    }

    @Input({ transform: booleanAttribute })
    public set required(value: boolean) {
        this.#elementRef.nativeElement.required = value;
    }

    public get required() {
        let validation;
        if (this.#ngControl && this.#ngControl.control && this.#ngControl.control.validator) {
            validation = this.#ngControl.control.validator({} as AbstractControl);
        }
        return (
            (validation && validation['required']) ||
            this.#elementRef.nativeElement.hasAttribute('required')
        );
    }

    isTextArea = false;
    isInput = false;

    #valid = InputState.NONE;
    #fileNames: string | null = null;

    ngAfterViewInit() {
        if (this.#ngControl && this.#ngControl.disabled !== null) {
            this.disabled = this.#ngControl.disabled;
        }

        if (!this.#ngControl) {
            this.#valid = InputState.NONE;
        }

        this.setAttribute('aria-required', this.required.toString());

        this.detectElementTag();

        this.#changeDetectorRef.detectChanges();
    }

    protected onInput() {
        this.checkNativeValidity();
    }

    protected onBlur() {
        this.updateValidation();
    }

    protected onChange(event: Event) {
        if (this.#elementRef.nativeElement.type === 'file') {
            const fileList: FileList | null = (event.target as HTMLInputElement).files;
            const fileArray: File[] = [];

            if (fileList) {
                for (const file of Array.from(fileList)) {
                    fileArray.push(file);
                }
            }

            this.#fileNames = fileArray.map((f: File) => f.name).join(', ');

            if (this.required && fileList && fileList.length > 0) {
                this.#valid = InputState.NONE;
            }
        }
    }

    protected onFocus() {
        this.#elementRef.nativeElement.focus();
    }

    private detectElementTag() {
        const elementTag = this.#elementRef.nativeElement.tagName.toLowerCase();
        if (elementTag === 'textarea') {
            this.isTextArea = true;
        } else {
            this.isInput = true;
        }
    }

    private updateValidation() {
        if (this.#ngControl) {
            this.setAttribute('aria-required', this.required.toString());

            const ariaInvalid = this.#valid === InputState.INVALID;

            this.setAttribute('aria-invalid', ariaInvalid.toString());
        } else {
            this.checkNativeValidity();
        }
    }

    private setAttribute(name: string, value: string) {
        this.#renderer.setAttribute(this.#elementRef.nativeElement, name, value);
    }

    private hasNativeValidators(): boolean {
        for (const nativeValidationAttribute of validationAttributes) {
            if (this.#elementRef.nativeElement.hasAttribute(nativeValidationAttribute)) {
                return true;
            }
        }
        return false;
    }

    private checkNativeValidity() {
        if (!this.disabled && this.hasNativeValidators()) {
            this.#valid = this.#elementRef.nativeElement.checkValidity();
        }
    }
}
