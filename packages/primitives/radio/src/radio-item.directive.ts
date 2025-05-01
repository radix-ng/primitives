import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    input,
    OnInit,
    signal
} from '@angular/core';
import { provideToken } from '@radix-ng/primitives/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { RDX_RADIO_GROUP } from './radio-tokens';

export const RdxRadioItemToken = new InjectionToken<RdxRadioItemDirective>('RadioItemToken');

export function injectRadioItem(): RdxRadioItemDirective {
    return inject(RdxRadioItemToken);
}

@Directive({
    selector: '[rdxRadioItem]',
    exportAs: 'rdxRadioItem',
    providers: [provideToken(RdxRadioItemToken, RdxRadioItemDirective)],
    hostDirectives: [
        { directive: RdxRovingFocusItemDirective, inputs: ['tabStopId: id', 'focusable', 'active', 'allowShiftKey'] }],

    host: {
        type: 'button',
        role: 'radio',
        '[attr.aria-checked]': 'checkedState()',
        '[attr.data-disabled]': 'disabledState() ? "" : null',
        '[attr.data-state]': 'checkedState() ? "checked" : "unchecked"',
        '[disabled]': 'disabledState()',
        '(click)': 'onClick()',
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp()',
        '(focus)': 'onFocus()'
    }
})
export class RdxRadioItemDirective implements OnInit {
    private readonly radioGroup = inject(RDX_RADIO_GROUP);
    private readonly elementRef = inject(ElementRef);

    readonly value = input.required<string>();

    readonly id = input<string>();

    readonly required = input<boolean>();

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly disabledState = computed(() => this.radioGroup.disableState() || this.disabled());

    readonly checkedState = computed(() => this.radioGroup.value() === this.value());

    private readonly ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    private readonly isArrowKeyPressedSignal = signal(false);

    /** @ignore */
    ngOnInit() {
        if (this.radioGroup.defaultValue === this.value()) {
            this.radioGroup.select(this.value());
        }
    }

    /** @ignore */
    onClick() {
        if (!this.disabledState()) {
            this.radioGroup.select(this.value());
            this.isArrowKeyPressedSignal.set(true);
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
        this.radioGroup.select(this.value());
        setTimeout(() => {
            /**
             * When navigating with arrow keys, focus triggers on the radio item.
             * To "check" the radio, we programmatically trigger a click event.
             */
            if (this.isArrowKeyPressedSignal()) {
                this.elementRef.nativeElement.click();
            }
        }, 0);
    }
}
