import { Directive, effect, ElementRef, inject, OnInit, signal } from '@angular/core';
import { injectNumberFieldRootContext } from './number-field-context.token';

@Directive({
    selector: 'input[rdxNumberFieldInput]',
    host: {
        role: 'spinbutton',
        type: 'text',
        tabindex: '0',
        autocomplete: 'off',
        autocorrect: 'off',
        spellcheck: 'false',
        'aria-roledescription': 'Number field',

        '[attr.aria-valuenow]': 'rootContext.value()',
        '[attr.inputmode]': 'rootContext.inputMode()',
        '[attr.disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.value]': 'inputValue()',

        '(change)': 'onChange()',
        '(input)': 'onInput($event)',
        '(blur)': 'onKeydownEnter($event)',
        '(beforeinput)': 'onBeforeInput($event)',
        '(keydown.enter)': 'onKeydownEnter($event)',
        '(keydown.arrowup)': 'onKeydownUp($event)',
        '(keydown.arrowdown)': 'onKeydownDown($event)'
    }
})
export class RdxNumberFieldInputDirective implements OnInit {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    protected readonly rootContext = injectNumberFieldRootContext();

    readonly inputValue = signal(this.rootContext.textValue());

    constructor() {
        effect(() => {
            this.inputValue.set(this.rootContext.textValue());
            this.rootContext.setInputValue(this.inputValue());
        });
    }

    ngOnInit() {
        this.rootContext.onInputElement(this.elementRef.nativeElement as HTMLInputElement);
    }

    onBeforeInput(event: InputEvent) {
        const target = event.target as HTMLInputElement;
        const nextValue =
            target.value.slice(0, target.selectionStart ?? undefined) +
            (event.data ?? '') +
            target.value.slice(target.selectionEnd ?? undefined);

        if (!this.rootContext.validate(nextValue)) {
            event.preventDefault();
        }
    }

    onInput(event: InputEvent) {
        const target = event.target as HTMLInputElement;
        this.rootContext.applyInputValue(target.value);
    }

    onChange() {
        this.inputValue.set(this.rootContext.textValue());
    }

    onKeydownEnter(event: KeyboardEvent) {
        const target = event.target as HTMLInputElement;
        this.rootContext.applyInputValue(target.value);
    }

    onKeydownUp(event: KeyboardEvent) {
        event.preventDefault();
        this.rootContext.handleIncrease();
    }

    onKeydownDown(event: KeyboardEvent) {
        event.preventDefault();
        this.rootContext.handleDecrease();
    }
}
