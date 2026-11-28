import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { RDX_COMPOSITE_PARENT, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    Direction,
    provideFormUiState,
    provideValueAccessor,
    RdxFormUiStateHost
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { injectToolbarRootContext } from '@radix-ng/primitives/toolbar';
import { RdxToggleGroupBase, toggleGroupContext } from './toggle-group-base';
import { provideToggleGroupContext } from './toggle-group-context';

/**
 * A set of two-state buttons that can be toggled on or off. Inside Toolbar, its items share
 * the Toolbar's composite focus.
 *
 * @see https://base-ui.com/react/components/toggle-group
 */
@Directive({
    selector: '[rdxToggleGroup]',
    exportAs: 'rdxToggleGroup',
    hostDirectives: [RdxCompositeRoot, RdxFormUiStateHost],
    providers: [
        { provide: RDX_COMPOSITE_PARENT, useFactory: () => injectToolbarRootContext(true) !== null },
        provideToggleGroupContext(() => toggleGroupContext(inject(RdxToggleGroup))),
        provideValueAccessor(RdxToggleGroup),
        provideFormUiState(() => inject(RdxToggleGroup).formUi)
    ]
})
export class RdxToggleGroup extends RdxToggleGroupBase {
    /** Text direction for arrow-key navigation. */
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    readonly dir = injectDirection(this.dirInput);

    /**
     * Whether keyboard navigation should loop from the last item back to the first.
     *
     * @default true
     */
    readonly loopFocus = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });
    private readonly disabledIndices = computed(() =>
        Array.from(this.compositeRoot.itemMap().values())
            .filter((metadata) => metadata['disabled'] === true && metadata['focusableWhenDisabled'] !== true)
            .map((metadata) => metadata.index)
    );
    constructor() {
        super();
        if (this.toolbarRoot) return;

        effect(() => {
            this.compositeRoot.setOrientation(this.orientation());
            this.compositeRoot.setDir(this.dir());
            this.compositeRoot.setLoopFocus(this.loopFocus());
            this.compositeRoot.setEnableHomeAndEndKeys(true);
        });

        effect(() => {
            this.compositeRoot.setDisabledIndices(this.disabledIndices());
        });
    }
}
