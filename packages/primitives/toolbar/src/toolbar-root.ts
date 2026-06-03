import { provideToolbarRootContext, RdxToolbarRootContext } from './toolbar-context';
import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { RdxCompositeMetadata, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { BooleanInput, DataOrientation, Direction } from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';

const rootContext = (): RdxToolbarRootContext => {
    const root = inject(RdxToolbarRoot);
    return {
        orientation: root.orientation,
        disabled: root.disabled
    };
};

/**
 * A container for grouping a set of controls, such as buttons, toggle groups or menus.
 * Owns composite keyboard focus over its items.
 *
 * @see https://base-ui.com/react/components/toolbar
 */
@Directive({
    selector: '[rdxToolbarRoot]',
    exportAs: 'rdxToolbarRoot',
    hostDirectives: [RdxCompositeRoot],
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

    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });
    private readonly itemMetadata = computed(() =>
        Array.from(this.compositeRoot.itemMap().values()).filter(isToolbarItemMetadata)
    );
    private readonly disabledIndices = computed(() =>
        this.itemMetadata()
            .filter((metadata) => metadata.disabled && !metadata.focusableWhenDisabled)
            .map((metadata) => metadata.index)
    );

    constructor() {
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

export interface RdxToolbarItemMetadata {
    [key: string]: unknown;
    disabled: boolean;
    focusableWhenDisabled: boolean;
}

function isToolbarItemMetadata(
    metadata: RdxCompositeMetadata
): metadata is RdxCompositeMetadata<RdxToolbarItemMetadata> {
    return typeof metadata['disabled'] === 'boolean' && typeof metadata['focusableWhenDisabled'] === 'boolean';
}
