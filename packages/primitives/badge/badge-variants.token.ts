// badge-variants.token.ts
import { InjectionToken } from '@angular/core';

export interface BadgeVariants {
    variants: string[];
}

export function badgeVariantsFactory(): BadgeVariants {
    return {
        variants: ['default', 'secondary']
    };
}

export const BADGE_VARIANTS_TOKEN = new InjectionToken<BadgeVariants>('BadgeVariants', {
    providedIn: 'root',
    factory: badgeVariantsFactory
});
