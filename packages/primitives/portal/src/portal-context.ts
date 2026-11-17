import { InjectionToken } from '@angular/core';

/** @internal Render-phase relocation follows Angular declaration ancestry, including retained views. */
export const RDX_PORTAL_RELOCATION = new InjectionToken<{ relocate(): void }>('RdxPortalRelocation');
