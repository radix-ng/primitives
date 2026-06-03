import { RdxToggleGroupBase, toggleGroupContext } from './toggle-group-base';
import { provideToggleGroupContext } from './toggle-group-context';
import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RdxCompositeMetadata, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import {
    BooleanInput,
    Direction,
    provideFormUiState,
    provideValueAccessor,
    RdxFormUiStateHost
} from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';

/**
 * A set of two-state buttons that can be toggled on or off. Owns composite keyboard focus over its
 * `[rdxToggle]` children.
 *
 * @see https://base-ui.com/react/components/toggle-group
 */
@Directive({
    selector: '[rdxToggleGroup]',
    exportAs: 'rdxToggleGroup',
    hostDirectives: [RdxCompositeRoot, RdxFormUiStateHost],
    providers: [
        provideToggleGroupContext(() => toggleGroupContext(inject(RdxToggleGroup))),
        provideValueAccessor(RdxToggleGroup),
        provideFormUiState(() => inject(RdxToggleGroup).formUi)
    ]
})
export class RdxToggleGroup extends RdxToggleGroupBase {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

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
    private readonly itemMetadata = computed(() =>
        Array.from(this.compositeRoot.itemMap().values()).filter(isToggleItemMetadata)
    );
    private readonly disabledIndices = computed(() =>
        this.itemMetadata()
            .filter((metadata) => metadata.disabled)
            .map((metadata) => metadata.index)
    );
    private readonly activeIndex = computed(() => {
        const pressedValues = this.pressedValues();
        if (pressedValues.length === 0) {
            return -1;
        }

        return this.itemMetadata().find((metadata) => pressedValues.includes(metadata.value))?.index ?? -1;
    });

    constructor() {
        super();

        effect(() => {
            this.compositeRoot.setOrientation(this.orientation());
            this.compositeRoot.setDir(this.dir());
            this.compositeRoot.setLoopFocus(this.loopFocus());
            this.compositeRoot.setEnableHomeAndEndKeys(true);
        });

        effect(() => {
            this.compositeRoot.setDisabledIndices(this.disabledIndices());
        });

        effect(() => {
            const activeIndex = this.activeIndex();

            if (activeIndex === -1 || this.disabledIndices().includes(activeIndex)) {
                return;
            }

            const activeElement = this.elementRef.nativeElement.ownerDocument.activeElement;
            if (activeElement && this.elementRef.nativeElement.contains(activeElement)) {
                return;
            }

            this.compositeRoot.setHighlightedIndex(activeIndex);
        });
    }
}

interface RdxToggleItemMetadata {
    [key: string]: unknown;
    disabled: boolean;
    value: string;
}

function isToggleItemMetadata(metadata: RdxCompositeMetadata): metadata is RdxCompositeMetadata<RdxToggleItemMetadata> {
    return typeof metadata['disabled'] === 'boolean' && typeof metadata['value'] === 'string';
}
