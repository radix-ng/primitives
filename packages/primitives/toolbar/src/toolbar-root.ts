import { booleanAttribute, Directive, effect, inject, input } from '@angular/core';
import { BooleanInput, DataOrientation } from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { Direction, RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { provideToolbarRootContext, RdxToolbarRootContext } from './toolbar-context';

const rootContext = (): RdxToolbarRootContext => {
    const root = inject(RdxToolbarRoot);
    return {
        orientation: root.orientation,
        disabled: root.disabled
    };
};

/**
 * A container for grouping a set of controls, such as buttons, toggle groups or menus.
 * Owns roving keyboard focus over its items.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarRoot]',
    exportAs: 'rdxToolbarRoot',
    hostDirectives: [RdxRovingFocusGroupDirective],
    providers: [provideToolbarRootContext(rootContext)],
    host: {
        role: 'toolbar',
        '[attr.aria-orientation]': 'orientation()',
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxToolbarRoot {
    /**
     * The orientation of the toolbar.
     *
     * @default 'horizontal'
     */
    readonly orientation = input<DataOrientation>('horizontal');

    /** Text direction for arrow-key navigation. */
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

    /**
     * Whether keyboard navigation should loop from the last item back to the first.
     *
     * @default true
     */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /**
     * Whether the whole toolbar is disabled.
     *
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    private readonly rovingFocusGroup = inject(RdxRovingFocusGroupDirective, { self: true });

    constructor() {
        effect(() => {
            this.rovingFocusGroup.setOrientation(this.orientation());
            this.rovingFocusGroup.setDir(this.dir());
            this.rovingFocusGroup.setLoop(this.loopFocus());
        });
    }
}
