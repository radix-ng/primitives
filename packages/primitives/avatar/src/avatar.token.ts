import { inject, InjectionToken } from '@angular/core';

import type { RdxAvatarDirective } from './avatar.directive';

export const RdxAvatarToken = new InjectionToken<RdxAvatarDirective>('RdxAvatarToken');

export function injectAvatar(): RdxAvatarDirective {
    return inject(RdxAvatarToken);
}
