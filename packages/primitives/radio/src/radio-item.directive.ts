import { booleanAttribute, Directive, ElementRef, inject, InjectionToken, Input, OnInit, signal } from '@angular/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { RDX_RADIO_GROUP } from './radio-tokens';

export const RdxRadioItemToken = new InjectionToken<RdxRadioItemDirective>('RadioItemToken');

export function injectRadioItem(): RdxRadioItemDirective {
    return inject(RdxRadioItemToken);
}

@Directive({
    selector: '[rdxRadioItem]',
    exportAs: 'rdxRadioItem',
    standalone: true,
    providers: [{ provide: RdxRadioItemToken, useExisting: RdxRadioItemDirective }],
    hostDirectives: [
        { directive: RdxRovingFocusItemDirective, inputs: ['tabStopId: id', 'focusable', 'active', 'allowShiftKey'] }],
    host: {
        type: 'button',
        role: 'radio',
        '[attr.aria-checked]': 'checked',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.data-state]': 'checked ? "checked" : "unchecked"',
        '(click)': 'onClick()',
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp()',
        '(focus)': 'onFocus()'
    }
})
export class RdxRadioItemDirective implements OnInit {
    private readonly radioGroup = inject(RDX_RADIO_GROUP);
    private readonly element = inject(ElementRef);

    @Input() id: string;

    @Input({ required: true }) value!: string;

    @Input({ transform: booleanAttribute }) disabled = false;

    private readonly ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    private isArrowKeyPressedSignal = signal(false);

    /** @ignore */
    ngOnInit() {
        if (this.radioGroup.defaultValue === this.value) {
            this.radioGroup.select(this.value);
        }
    }

    /** @ignore */
    get checked(): boolean {
        return this.radioGroup.value === this.value;
    }

    /** @ignore */
    onClick() {
        if (!this.disabled) {
            this.radioGroup.select(this.value);
        }
    }

    /** @ignore */
    onKeyDown(event: KeyboardEvent): void {
        if (this.ARROW_KEYS.includes(event.key)) {
            this.isArrowKeyPressedSignal.set(true);
        }
    }

    /** @ignore */
    onKeyUp() {
        this.isArrowKeyPressedSignal.set(false);
    }

    /** @ignore */
    onFocus() {
        setTimeout(() => {
            /**
             * When navigating with arrow keys, focus triggers on the radio item.
             * To "check" the radio, we programmatically trigger a click event.
             */
            if (this.isArrowKeyPressedSignal()) {
                this.element.nativeElement.click();
            }
        }, 0);
    }
}
