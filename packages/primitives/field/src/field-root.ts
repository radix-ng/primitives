import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, inject, input, signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

let fieldId = 0;

const attr = (value: boolean) => (value ? '' : undefined);

const addId = (ids: string[], id: string) => (ids.includes(id) ? ids : [...ids, id]);
const removeId = (ids: string[], id: string) => ids.filter((item) => item !== id);

const fieldRootContext = () => {
    const root = injectFieldRoot();

    return {
        controlId: root.controlId,
        descriptionIds: root.descriptionIds,
        errorIds: root.errorIds,
        invalidState: root.invalidState,
        disabledState: root.disabledState,
        requiredState: root.requiredState,
        dirtyState: root.dirtyState,
        touchedState: root.touchedState,
        filledState: root.filledState,
        focusedState: root.focusedState,
        setControlId: (id: string) => root.controlId.set(id),
        addDescriptionId: (id: string) => root.descriptionIds.update((ids) => addId(ids, id)),
        removeDescriptionId: (id: string) => root.descriptionIds.update((ids) => removeId(ids, id)),
        addErrorId: (id: string) => root.errorIds.update((ids) => addId(ids, id)),
        removeErrorId: (id: string) => root.errorIds.update((ids) => removeId(ids, id)),
        setFocused: (value: boolean) => root.focusedValue.set(value),
        setFilled: (value: boolean) => root.filledValue.set(value)
    };
};

export type RdxFieldRootContext = ReturnType<typeof fieldRootContext>;

export const [injectFieldRootContext, provideFieldRootContext] = createContext<RdxFieldRootContext>('RdxFieldRoot');

/**
 * Groups a form control with its label, description, error message, and field state.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldRoot]',
    exportAs: 'rdxFieldRoot',
    providers: [provideFieldRootContext(fieldRootContext)],
    host: {
        '[attr.data-invalid]': 'dataAttr(invalidState())',
        '[attr.data-valid]': 'dataAttr(!invalidState())',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(requiredState())',
        '[attr.data-dirty]': 'dataAttr(dirtyState())',
        '[attr.data-touched]': 'dataAttr(touchedState())',
        '[attr.data-filled]': 'dataAttr(filledState())',
        '[attr.data-focused]': 'dataAttr(focusedState())'
    }
})
export class RdxFieldRoot {
    /**
     * Whether the field is invalid.
     *
     * @group Props
     * @defaultValue false
     */
    readonly invalid = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field is disabled.
     *
     * @group Props
     * @defaultValue false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field is required.
     *
     * @group Props
     * @defaultValue false
     */
    readonly required = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field value has changed from its initial value.
     *
     * @group Props
     * @defaultValue false
     */
    readonly dirty = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the field has been blurred after receiving focus.
     *
     * @group Props
     * @defaultValue false
     */
    readonly touched = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Overrides whether the control has a non-empty value.
     *
     * @group Props
     */
    readonly filled = input<boolean>();

    /**
     * Overrides whether the control is focused.
     *
     * @group Props
     */
    readonly focused = input<boolean>();

    readonly controlId = signal(`rdx-field-control-${fieldId++}`);
    readonly descriptionIds = signal<string[]>([]);
    readonly errorIds = signal<string[]>([]);

    readonly focusedValue = signal(false);
    readonly filledValue = signal(false);

    readonly invalidState = computed(() => this.invalid());
    readonly disabledState = computed(() => this.disabled());
    readonly requiredState = computed(() => this.required());
    readonly dirtyState = computed(() => this.dirty());
    readonly touchedState = computed(() => this.touched());
    readonly filledState = computed(() => this.filled() ?? this.filledValue());
    readonly focusedState = computed(() => this.focused() ?? this.focusedValue());

    protected readonly dataAttr = attr;
}

function injectFieldRoot(): RdxFieldRoot {
    return inject(RdxFieldRoot);
}
