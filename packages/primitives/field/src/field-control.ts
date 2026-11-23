import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input
} from '@angular/core';
import { BooleanInput, injectId } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from './field-root';
import type { RdxFieldNativeControl } from './field-value-missing';

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
        // `aria-invalid`/`data-*` follow the field's tri-state `validState`: while it is neutral (`null`,
        // e.g. a field whose `validationMode` defers display (e.g. `onBlur`) before interaction) the control emits no `aria-invalid`
        // and neither `data-valid` nor `data-invalid`, matching the field root.
        '[attr.aria-invalid]': 'rootContext.validState() === false ? "true" : undefined',
        // On a native control the native `required`/`disabled` attributes already convey the state, so
        // `aria-required`/`aria-disabled` are only emitted on non-native (custom) controls.
        '[attr.aria-required]': '!isNativeFormControl && requiredState() ? "true" : undefined',
        '[attr.aria-disabled]': '!isNativeFormControl && disabledState() ? "true" : undefined',
        '[attr.disabled]': 'isNativeFormControl && disabledState() ? "" : undefined',
        '[attr.required]': 'isNativeFormControl && requiredState() ? "" : undefined',
        '[attr.data-invalid]': 'dataAttr(rootContext.validState() === false)',
        '[attr.data-valid]': 'dataAttr(rootContext.validState() === true)',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
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
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    private initialValue = '';

    /**
     * Control id. Labels and descriptions use this value for accessible relationships.
     *
     * @group Props
     */
    readonly id = input(injectId('rdx-field-control-'));

    /** Disables the control independently of the enclosing Field. */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Marks the control required independently of the enclosing Field. */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly disabledState = computed(() => this.disabled() || this.rootContext.disabledState());
    protected readonly requiredState = computed(() => this.required() || this.rootContext.requiredState());
    protected readonly isNativeFormControl = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(this.element.tagName);

    protected readonly describedBy = computed(() => {
        const ids = [...this.rootContext.descriptionIds(), ...this.rootContext.errorIds()];

        return ids.length ? ids.join(' ') : undefined;
    });

    constructor() {
        effect(() => {
            this.rootContext.setControlId(this.id());
        });

        if (this.isNativeFormControl) {
            const unregister = this.rootContext.registerNativeControl({
                element: this.element as RdxFieldNativeControl['element'],
                focusTarget: () => this.element,
                participates: () => !this.disabledState()
            });
            inject(DestroyRef).onDestroy(unregister);
        }

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

    protected readonly dataAttr = attr;

    private currentValue(): string {
        const element = this.element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        return element.value ?? '';
    }
}
