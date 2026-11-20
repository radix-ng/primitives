import type { RdxFieldRootContext } from './field-root';

/** @internal Merge explicit, group and item descriptions without duplicating shared Field error IDs. */
export function fieldDescribedBy(explicit: string | undefined, ...fields: (RdxFieldRootContext | null)[]) {
    const ids = new Set(explicit?.split(/\s+/).filter(Boolean));
    for (const field of fields) {
        field?.descriptionIds().forEach((id) => ids.add(id));
        field?.errorIds().forEach((id) => ids.add(id));
    }
    return ids.size ? [...ids].join(' ') : undefined;
}
