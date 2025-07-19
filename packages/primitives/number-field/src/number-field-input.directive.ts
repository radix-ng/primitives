import { Directive, effect, ElementRef, inject, OnInit, signal } from '@angular/core';
import { getActiveElement } from '@radix-ng/primitives/core';
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
        '[attr.aria-valuemin]': 'rootContext.min()',
        '[attr.aria-valuemax]': 'rootContext.max()',
        '[attr.inputmode]': 'rootContext.inputMode()',
        '[attr.disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.value]': 'inputValue()',

        '(change)': 'onChange()',
        '(input)': 'onInput($event)',
        '(blur)': 'onKeydownEnter($event)',
        '(beforeinput)': 'onBeforeInput($event)',
        '(keydown.enter)': 'onKeydownEnter($event)',
        '(keydown.arrowUp)': 'onKeydownUp($event)',
        '(keydown.arrowDown)': 'onKeydownDown($event)',
        '(keydown.home)': 'onKeydownHome($event)',
        '(keydown.end)': 'onKeydownEnd($event)',
        '(keydown.pageUp)': 'onKeydownPageUp($event)',
        '(keydown.pageDown)': 'onKeydownPageDown($event)',
        '(wheel)': 'onWheelEvent($event)'
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

    onWheelEvent(event: WheelEvent) {
        if (this.rootContext.disableWheelChange()) {
            return;
        }

        // only handle when in focus
        if (event.target !== getActiveElement()) return;

        // if on a trackpad, users can scroll in both X and Y at once, check the magnitude of the change
        // if it's mostly in the X direction, then just return, the user probably doesn't mean to inc/dec
        // this isn't perfect, events come in fast with small deltas and a part of the scroll may give a false indication
        // especially if the user is scrolling near 45deg
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
            return;
        }

        event.preventDefault();
        if (event.deltaY > 0) {
            this.rootContext.handleIncrease();
        } else if (event.deltaY < 0) {
            this.rootContext.handleDecrease();
        }
    }

    onKeydownPageUp(event: KeyboardEvent) {
        event.preventDefault();
        this.rootContext.handleIncrease(10);
    }

    onKeydownPageDown(event: KeyboardEvent) {
        event.preventDefault();
        this.rootContext.handleDecrease(10);
    }

    onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        this.rootContext.handleMinMaxValue('min');
    }

    onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        this.rootContext.handleMinMaxValue('max');
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
