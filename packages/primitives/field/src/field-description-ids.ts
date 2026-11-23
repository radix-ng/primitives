import { computed, signal } from '@angular/core';
import { createLabelRegistry } from '@radix-ng/primitives/core';
import type { RdxFieldRootContext } from './field-root';

/** @internal Each registration retains its ID until its own cleanup runs. */
export function createFieldIdRegistry() {
    const registrations = signal<readonly { id: string }[]>([]);
    return {
        ids: computed(() => [...new Set(registrations().map(({ id }) => id))]),
        register(id: string) {
            const registration = { id };
            registrations.update((entries) => [...entries, registration]);
            return () => registrations.update((entries) => entries.filter((entry) => entry !== registration));
        }
    };
}

/** @internal Associations shared by Field Root and Field Item. */
export function createFieldAssociations() {
    const controls = createLabelRegistry();
    const compositeControlId = signal('');
    const descriptions = createFieldIdRegistry();
    return {
        controlId: computed(() => controls.labelId() ?? compositeControlId()),
        setControlId: compositeControlId.set,
        registerControlId: controls.registerLabel,
        descriptionIds: descriptions.ids,
        registerDescription: descriptions.register
    };
}

/** @internal Merge explicit, group and item descriptions without duplicating shared Field error IDs. */
export function fieldDescribedBy(explicit: string | undefined, ...fields: (RdxFieldRootContext | null)[]) {
    const ids = new Set(explicit?.split(/\s+/).filter(Boolean));
    for (const field of fields) {
        field?.descriptionIds().forEach((id) => ids.add(id));
        field?.errorIds().forEach((id) => ids.add(id));
    }
    return ids.size ? [...ids].join(' ') : undefined;
}
