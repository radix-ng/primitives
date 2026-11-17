import { HostAttributeToken, inject, numberAttribute } from '@angular/core';
import { NumberInput } from '../types';

/** Coerces an authored tabindex while retaining removal and default-restoration values. */
export function coerceTabIndex(value: NumberInput): number | null | undefined {
    return value == null ? value : numberAttribute(value, 0);
}

/** Reads the consumer's static lowercase tabindex before behavior defaults are applied. */
export function injectTabIndexAttribute(): number | undefined {
    return coerceTabIndex(inject(new HostAttributeToken('tabindex'), { optional: true })) ?? undefined;
}
