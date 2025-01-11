import { inject, InjectionToken, Provider } from '@angular/core';
import { RdxToolbarRootDirective } from './toolbar-root.directive';

export const RDX_TOOLBAR_ROOT_TOKEN = new InjectionToken<RdxToolbarRootDirective>('RdxToolbarRootDirective');

export function injectRootContext(): RdxToolbarRootDirective {
    return inject(RDX_TOOLBAR_ROOT_TOKEN);
}

export function provideRootContext(): Provider {
    return {
        provide: RDX_TOOLBAR_ROOT_TOKEN,
        useExisting: RdxToolbarRootDirective
    };
}
