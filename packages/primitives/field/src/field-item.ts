import { booleanAttribute, computed, Directive, inject, input, signal } from '@angular/core';
import { BooleanInput, injectId, RDX_FIELD_VALIDITY } from '@radix-ng/primitives/core';
import { provideFieldRootContext, RdxFieldRoot, RdxFieldRootContext } from './field-root';

const attr = (value: boolean) => (value ? '' : undefined);
const addId = (ids: string[], id: string) => (ids.includes(id) ? ids : [...ids, id]);
const removeId = (ids: string[], id: string) => ids.filter((item) => item !== id);

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
        controlId: item.controlId,
        name: root.name,
        descriptionIds: item.descriptionIds,
        errorIds: root.errorIds,
        messages: root.messages,
        notifyEdited: () => root.notifyEdited(),
        validState: root.validState,
        formSubmitAttempted: root.formSubmitAttempted,
        invalidState: root.invalidState,
        disabledState: item.disabledState,
        requiredState: root.requiredState,
        dirtyState: root.dirtyState,
        touchedState: root.touchedState,
        filledState: root.filledState,
        focusedState: root.focusedState,
        setControlId: (id: string) => item.controlId.set(id),
        addDescriptionId: (id: string) => item.descriptionIds.update((ids) => addId(ids, id)),
        removeDescriptionId: (id: string) => item.descriptionIds.update((ids) => removeId(ids, id)),
        addErrorId: (id: string) => root.errorIds.update((ids) => addId(ids, id)),
        removeErrorId: (id: string) => root.errorIds.update((ids) => removeId(ids, id)),
        setFocused: (value: boolean) => root.focusedValue.set(value),
        setFilled: (value: boolean) => root.filledValue.set(value),
        setDirty: (value: boolean) => root.dirtyValue.set(value),
        setTouched: (value: boolean) => root.touchedValue.set(value),
        setStateProvider: (provider) => root.setStateProvider(provider),
        clearStateProvider: (provider, previous) => root.clearStateProvider(provider, previous),
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

    /** This item's control id — label / description / control inside the item associate with it. */
    readonly controlId = signal(injectId('rdx-field-item-control-'));
    /** Description ids for this item's control `aria-describedby`. */
    readonly descriptionIds = signal<string[]>([]);

    /** The item's effective disabled state: the root's disabled OR the item's. */
    readonly disabledState = computed(() => this.root.disabledState() || this.disabled());

    protected readonly dataAttr = attr;
}
