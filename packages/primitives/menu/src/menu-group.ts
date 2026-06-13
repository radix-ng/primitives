import { Directive, inject, signal } from '@angular/core';
import { provideRdxMenuGroupContext, RdxMenuGroupContext } from './menu-group-context';

const groupContextFactory = (): RdxMenuGroupContext => {
    const instance = inject(RdxMenuGroup);
    return { labelId: instance.labelId };
};

/**
 * Groups related menu items together.
 */
@Directive({
    selector: '[rdxMenuGroup]',
    exportAs: 'rdxMenuGroup',
    providers: [provideRdxMenuGroupContext(groupContextFactory)],
    host: {
        role: 'group',
        '[attr.aria-labelledby]': 'labelId()'
    }
})
export class RdxMenuGroup {
    readonly labelId = signal<string | undefined>(undefined);
}
