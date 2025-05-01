import { inject, InjectionToken } from '@angular/core';

export interface IRdxToggleGroup {
    toggle(value: string): void;
    disabled: any;
    value: any;
    type: any;
}

export const RdxToggleGroupToken = new InjectionToken<IRdxToggleGroup>('RdxToggleGroupToken');

export function injectToggleGroup(): IRdxToggleGroup {
    return inject(RdxToggleGroupToken);
}
