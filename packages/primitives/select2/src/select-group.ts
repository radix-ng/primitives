import { Directive, inject } from '@angular/core';
import { _IdGenerator, createContext } from '@radix-ng/primitives/core';

const context = () => {
    const context = inject(RdxSelectGroup);

    return {
        id: context.id
    };
};

export type RdxSelectGroupContext = ReturnType<typeof context>;

export const [injectSelectGroupContext, provideSelectGroupContext] =
    createContext<RdxSelectGroupContext>('RdxSelectGroup');

@Directive({
    selector: '[rdxSelectGroup]',
    providers: [provideSelectGroupContext(context)],
    host: {
        role: 'group',
        '[attr.aria-labelledby]': 'id'
    }
})
export class RdxSelectGroup {
    readonly id = inject(_IdGenerator).getId('rdx-select-group-');
}
