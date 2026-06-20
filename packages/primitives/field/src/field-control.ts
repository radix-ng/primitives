import { afterNextRender, computed, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from './field-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Connects a form control to the field label, description, error, and state.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldControl]',
    exportAs: 'rdxFieldControl',
    host: {
        '[attr.id]': 'id()',
        '[attr.aria-describedby]': 'describedBy()',
        '[attr.aria-invalid]': 'rootContext.invalidState() ? "true" : undefined',
        // On a native control the native `required`/`disabled` attributes already convey the state, so
        // `aria-required`/`aria-disabled` are only emitted on non-native (custom) controls.
        '[attr.aria-required]': '!isNativeFormControl() && rootContext.requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': '!isNativeFormControl() && rootContext.disabledState() ? "true" : undefined',
        '[attr.disabled]': 'isNativeFormControl() && rootContext.disabledState() ? "" : undefined',
        '[attr.required]': 'isNativeFormControl() && rootContext.requiredState() ? "" : undefined',
        '[attr.data-invalid]': 'dataAttr(rootContext.invalidState())',
        '[attr.data-valid]': 'dataAttr(!rootContext.invalidState())',
        '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())',
        '[attr.data-required]': 'dataAttr(rootContext.requiredState())',
        '[attr.data-dirty]': 'dataAttr(rootContext.dirtyState())',
        '[attr.data-touched]': 'dataAttr(rootContext.touchedState())',
        '[attr.data-filled]': 'dataAttr(rootContext.filledState())',
        '[attr.data-focused]': 'dataAttr(rootContext.focusedState())',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()',
        '(input)': 'syncFilled()',
        '(change)': 'syncFilled()'
    }
})
export class RdxFieldControl {
    protected readonly rootContext = injectFieldRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private initialValue = '';

    /**
     * Control id. Labels and descriptions use this value for accessible relationships.
     *
     * @group Props
     */
    readonly id = input(injectId('rdx-field-control-'));

    protected readonly describedBy = computed(() => {
        const ids = [
            ...this.rootContext.descriptionIds(),
            ...(this.rootContext.invalidState() ? this.rootContext.errorIds() : [])
        ];

        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        effect(() => {
            this.rootContext.setControlId(this.id());
        });

        afterNextRender(() => {
            this.initialValue = this.currentValue();
            this.syncFilled();
        });
    }

    onFocus(): void {
        this.rootContext.setFocused(true);
    }

    onBlur(): void {
        this.rootContext.setFocused(false);
        this.rootContext.setTouched(true);
    }

    syncFilled(): void {
        const value = this.currentValue();

        this.rootContext.setFilled(Array.isArray(value) ? value.length > 0 : value != null && value !== '');
        this.rootContext.setDirty(value !== this.initialValue);
    }

    protected isNativeFormControl(): boolean {
        return ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(this.elementRef.nativeElement.tagName);
    }

    protected readonly dataAttr = attr;

    private currentValue(): string {
        const element = this.elementRef.nativeElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        return element.value ?? '';
    }
}
