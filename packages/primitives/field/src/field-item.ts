import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { BooleanInput, createLabelRegistry, RDX_FIELD_VALIDITY } from '@radix-ng/primitives/core';
import { createFieldAssociations } from './field-description-ids';
import { provideFieldRootContext, RdxFieldRoot, RdxFieldRootContext } from './field-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * The field item context **re-provides** {@link RdxFieldRootContext} so a label, description, and control
 * placed inside the item associate with the **item's** control (own `controlId` / `descriptionIds`),
 * while all validation state (`invalidState` / `dirtyState` / `touchedState` / `filledState` /
 * `focusedState` / `requiredState`, errors and messages) is **delegated to the enclosing `rdxFieldRoot`**.
 * `disabledState` is the item's `disabled` OR'd with the root's. The enclosing root is reached with
 * `skipSelf` (the item provides the same token), so there is no circular injection.
 */
const fieldItemContext = (): RdxFieldRootContext => {
    const item = inject(RdxFieldItem);
    const root = item.root;

    return {
        ...item.labelRegistry,
        ...item.associations,
        name: root.effectiveName,
        errorIds: root.errorIds,
        registerError: root.errorsRegistry.register,
        messages: root.messages,
        matchesError: (kind: string) => root.matchesError(kind),
        notifyEdited: () => root.notifyEdited(),
        validState: root.validState,
        formSubmitAttempted: root.formSubmitAttempted,
        pendingState: root.pendingState,
        invalidState: root.invalidState,
        disabledState: item.disabledState,
        requiredState: root.requiredState,
        dirtyState: root.dirtyState,
        touchedState: root.touchedState,
        filledState: root.filledState,
        focusedState: root.focusedState,
        setFocused: (value, owner) => root.setFocused(value, owner),
        setFilled: (value: boolean) => root.filledValue.set(value),
        registerControlState: (state) => root.registerControlState(state),
        registerNativeControl: (control) => root.registerNativeControl(control),
        setDirty: (value: boolean) => root.dirtyValue.set(value),
        setTouched: (value: boolean) => root.touchedValue.set(value),
        registerStateProvider: (provider) => root.registerStateProvider(provider),
        hasStateProvider: root.hasStateProvider
    };
};

/**
 * Groups an individual item in a checkbox group or radio group with its own label and description.
 *
 * Use inside a `rdxFieldRoot` (typically wrapping a group) when each control needs its own label /
 * description: the item scopes those associations to its control while reflecting the field's validation
 * state. Mirrors Base UI's `Field.Item`.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldItem]',
    exportAs: 'rdxFieldItem',
    providers: [
        provideFieldRootContext(fieldItemContext),
        // Items delegate validity to the root; expose the root's tri-state to controls inside the item.
        { provide: RDX_FIELD_VALIDITY, useFactory: () => inject(RdxFieldItem).root.validState }
    ],
    host: {
        // Tri-state, mirroring the root: neither attribute while the root's `validState` is neutral.
        '[attr.data-invalid]': 'dataAttr(root.validState() === false)',
        '[attr.data-valid]': 'dataAttr(root.validState() === true)',
        '[attr.data-disabled]': 'dataAttr(disabledState())',
        '[attr.data-required]': 'dataAttr(root.requiredState())',
        '[attr.data-dirty]': 'dataAttr(root.dirtyState())',
        '[attr.data-touched]': 'dataAttr(root.touchedState())',
        '[attr.data-filled]': 'dataAttr(root.filledState())',
        '[attr.data-focused]': 'dataAttr(root.focusedState())'
    }
})
export class RdxFieldItem {
    readonly labelRegistry = createLabelRegistry();
    /** The enclosing field root (items are leaves under the root, so `skipSelf` reaches it). */
    readonly root = inject(RdxFieldRoot, { skipSelf: true });

    /**
     * Whether the wrapped control should ignore user interaction. The `disabled` on `rdxFieldRoot` takes
     * precedence (it is OR'd in).
     *
     * @group Props
     * @defaultValue false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** @ignore */
    readonly associations = createFieldAssociations();
    readonly controlId = this.associations.controlId;
    readonly descriptionIds = this.associations.descriptionIds;

    /** The item's effective disabled state: the root's disabled OR the item's. */
    readonly disabledState = computed(() => this.root.disabledState() || this.disabled());

    protected readonly dataAttr = attr;
}
