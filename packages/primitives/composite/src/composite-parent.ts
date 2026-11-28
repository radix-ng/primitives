import { InjectionToken } from '@angular/core';

/** @internal Makes this host's composite root and list defer to their parent contexts. */
export const RDX_COMPOSITE_PARENT = new InjectionToken<boolean>('RDX_COMPOSITE_PARENT');
