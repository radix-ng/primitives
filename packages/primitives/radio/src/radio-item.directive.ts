import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    Renderer2
} from '@angular/core';
import { provideToken } from '@radix-ng/primitives/core';
import { Orientation, RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
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
        { directive: RdxRovingFocusItemDirective, inputs: ['tabStopId: id', 'focusable', 'active', 'allowShiftKey'] }
    ],

    host: {
        '[attr.type]': 'nativeButtonState() ? "button" : undefined',
        role: 'radio',
        '[attr.aria-checked]': 'checkedState()',
        '[attr.aria-readonly]': 'readonlyState() ? "true" : undefined',
        '[attr.aria-required]': 'requiredState() ? "true" : undefined',
        '[attr.data-checked]': 'checkedState() ? "" : undefined',
        '[attr.data-unchecked]': '!checkedState() ? "" : undefined',
        '[attr.data-disabled]': 'disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'readonlyState() ? "" : undefined',
        '[attr.data-required]': 'requiredState() ? "" : undefined',
        '[attr.data-state]': 'checkedState() ? "checked" : "unchecked"',
        '[attr.disabled]': 'nativeButtonState() && disabledState() ? "" : undefined',
        '(click)': 'onClick()',
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp()',
        '(focus)': 'onFocus()'
    }
})
export class RdxRadioItemDirective {
    private readonly radioGroup = inject(RDX_RADIO_GROUP);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly rovingFocusItem = inject(RdxRovingFocusItemDirective);
    private readonly destroyRef = inject(DestroyRef);
    private readonly inputElement = this.renderer.createElement('input') as HTMLInputElement;
    private previousCheckedState: boolean | undefined;

    readonly value = input.required<string>();

    readonly id = input<string>();

    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly nativeButton = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly nativeButtonState = computed(
        () => this.nativeButton() || this.elementRef.nativeElement.tagName === 'BUTTON'
    );

    readonly disabledState = computed(() => this.radioGroup.disabledState() || this.disabled());

    readonly readonlyState = computed(() => this.radioGroup.readonly() || this.readonly());

    readonly requiredState = computed(() => this.radioGroup.required() || this.required());

    readonly checkedState = computed(() => this.radioGroup.value() === this.value());

    private readonly ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;

    constructor() {
        this.createHiddenInput();
        const unlistenInputChange = this.renderer.listen(this.inputElement, 'change', () => {
            if (this.inputElement.checked) {
                this.radioGroup.select(this.value());
            }
        });

        this.destroyRef.onDestroy(() => {
            unlistenInputChange();
            const parent = this.inputElement.parentNode;

            if (parent) {
                this.renderer.removeChild(parent, this.inputElement);
            }
        });

        effect(() => {
            this.rovingFocusItem.setActive(this.checkedState());
            this.rovingFocusItem.setFocusable(!this.disabledState());
            this.syncHiddenInput();
        });
    }

    /** @ignore */
    onClick() {
        if (!this.disabledState() && !this.readonlyState()) {
            this.radioGroup.select(this.value());
        }
    }

    /** @ignore */
    onKeyDown(event: Event): void {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === ' ' || keyEvent.key === 'Enter') {
            this.onClick();
            return;
        }

        if (this.isAllowedArrowKey(keyEvent.key)) {
            this.radioGroup.setArrowNavigation(true);
        }
    }

    /** @ignore */
    onKeyUp() {
        this.radioGroup.setArrowNavigation(false);
    }

    /** @ignore */
    onFocus() {
        queueMicrotask(() => {
            if (this.radioGroup.isArrowNavigation()) {
                this.radioGroup.select(this.value());
                this.radioGroup.setArrowNavigation(false);
            }
        });
    }

    private isAllowedArrowKey(key: string): boolean {
        if (!(this.ARROW_KEYS as readonly string[]).includes(key)) {
            return false;
        }

        const orientation = this.radioGroup.orientation() ?? ('horizontal' satisfies Orientation);

        if (orientation === 'vertical') {
            return key === 'ArrowUp' || key === 'ArrowDown';
        }

        return key === 'ArrowLeft' || key === 'ArrowRight';
    }

    private createHiddenInput(): void {
        const host = this.elementRef.nativeElement;
        const parent = host.parentNode;

        this.renderer.setAttribute(this.inputElement, 'type', 'radio');
        this.renderer.setAttribute(this.inputElement, 'tabindex', '-1');
        this.renderer.setAttribute(this.inputElement, 'aria-hidden', 'true');
        this.renderer.setStyle(this.inputElement, 'position', 'absolute');
        this.renderer.setStyle(this.inputElement, 'pointer-events', 'none');
        this.renderer.setStyle(this.inputElement, 'opacity', '0');
        this.renderer.setStyle(this.inputElement, 'margin', '0');
        this.renderer.setStyle(this.inputElement, 'inset', '0');
        this.renderer.setStyle(this.inputElement, 'transform', 'translateX(-100%)');

        if (parent) {
            this.renderer.insertBefore(parent, this.inputElement, host.nextSibling);
        }
    }

    private syncHiddenInput(): void {
        const checked = this.checkedState();

        this.inputElement.name = this.radioGroup.name() ?? '';
        this.inputElement.value = this.value();
        this.inputElement.checked = checked;
        this.inputElement.required = this.requiredState();
        this.inputElement.disabled = this.disabledState();

        this.setOptionalAttribute('name', this.radioGroup.name());
        this.setOptionalAttribute('form', this.radioGroup.form());
        this.setBooleanAttribute('checked', checked);
        this.setBooleanAttribute('required', this.requiredState());
        this.setBooleanAttribute('disabled', this.disabledState());
        this.renderer.setAttribute(this.inputElement, 'value', this.value());

        if (this.previousCheckedState === false && checked) {
            this.inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            this.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }

        this.previousCheckedState = checked;
    }

    private setOptionalAttribute(name: string, value: string | undefined): void {
        if (value) {
            this.renderer.setAttribute(this.inputElement, name, value);
        } else {
            this.renderer.removeAttribute(this.inputElement, name);
        }
    }

    private setBooleanAttribute(name: string, value: boolean): void {
        if (value) {
            this.renderer.setAttribute(this.inputElement, name, '');
        } else {
            this.renderer.removeAttribute(this.inputElement, name);
        }
    }
}
