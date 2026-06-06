import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, effect, inject, input } from '@angular/core';
import { provideValueAccessor } from '@radix-ng/primitives/core';
import { Direction, RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';
import { RdxToggleGroupBase, toggleGroupContext } from './toggle-group-base';
import { provideToggleGroupContext } from './toggle-group-context';

/**
 * A set of two-state buttons that can be toggled on or off. Owns roving keyboard focus over its
 * `[rdxToggle]` children.
 *
 * @see https://base-ui.com/react/components/toggle-group
 */
@Directive({
    selector: '[rdxToggleGroup]',
    exportAs: 'rdxToggleGroup',
    hostDirectives: [RdxRovingFocusGroupDirective],
    providers: [
        provideToggleGroupContext(() => toggleGroupContext(inject(RdxToggleGroup))),
        provideValueAccessor(RdxToggleGroup)
    ]
})
export class RdxToggleGroup extends RdxToggleGroupBase {
    /** Text direction for arrow-key navigation. */
    readonly dir = input<Direction>('ltr');

    /**
     * Whether keyboard navigation should loop from the last item back to the first.
     *
     * @default true
     */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    private readonly rovingFocusGroup = inject(RdxRovingFocusGroupDirective, { self: true });

    constructor() {
        super();

        effect(() => {
            this.rovingFocusGroup.setOrientation(this.orientation());
            this.rovingFocusGroup.setDir(this.dir());
            this.rovingFocusGroup.setLoop(this.loopFocus());
        });
    }
}
