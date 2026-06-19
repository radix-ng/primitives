import { booleanAttribute, computed, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RdxCompositeMetadata, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { injectTabsRootContext } from './tabs-root-context';
import { RdxTabsTabMetadata } from './utils';

/**
 * Groups the individual tab buttons and manages keyboard navigation.
 *
 * @see https://base-ui.com/react/components/tabs
 */
@Directive({
    selector: '[rdxTabsList]',
    exportAs: 'rdxTabsList',
    hostDirectives: [RdxCompositeRoot],
    host: {
        role: 'tablist',
        '[attr.aria-orientation]': 'rootContext.orientation() === "vertical" ? "vertical" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-activation-direction]': 'rootContext.activationDirection()'
    }
})
export class RdxTabsList {
    protected readonly rootContext = injectTabsRootContext();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeRoot = inject(RdxCompositeRoot, { self: true });

    /**
     * Whether a tab is activated when it receives focus (automatic activation).
     * When `false`, tabs are only activated on click or Enter/Space.
     *
     * @default false
     */
    readonly activateOnFocus = input(false, { transform: booleanAttribute });

    /**
     * Whether keyboard navigation should loop from the last tab back to the first.
     *
     * @default true
     */
    readonly loopFocus = input(true, { transform: booleanAttribute });

    private readonly tabMap = computed(() => {
        const map = new Map<HTMLElement, RdxCompositeMetadata<RdxTabsTabMetadata>>();

        this.compositeRoot.itemMap().forEach((metadata, element) => {
            if (isTabsTabMetadata(metadata)) {
                map.set(element, metadata);
            }
        });

        return map;
    });

    private readonly tabMetadata = computed(() => Array.from(this.tabMap().values()));

    private readonly disabledIndices = computed(() =>
        this.tabMetadata()
            .filter((metadata) => metadata.disabled)
            .map((metadata) => metadata.index)
    );

    private readonly activeIndex = computed(() => {
        const value = this.rootContext.value();
        const metadata = this.tabMetadata().find((tab) => tab.value === value);

        return metadata?.index ?? -1;
    });

    constructor() {
        this.rootContext.setTabListElement(this.elementRef.nativeElement);

        effect(() => {
            this.compositeRoot.setOrientation(this.rootContext.orientation());
            this.compositeRoot.setLoopFocus(this.loopFocus());
            this.compositeRoot.setEnableHomeAndEndKeys(true);
        });

        effect(() => {
            this.compositeRoot.setDisabledIndices([]);
        });

        effect(() => {
            this.rootContext.setTabMap(this.tabMap());
        });

        effect(() => {
            const activeIndex = this.activeIndex();

            if (activeIndex === -1) {
                return;
            }

            const list = this.elementRef.nativeElement;
            const activeElement = list.ownerDocument.activeElement;

            if (activeElement && list.contains(activeElement)) {
                return;
            }

            if (this.disabledIndices().includes(activeIndex)) {
                const firstEnabledIndex = this.tabMetadata().find((metadata) => !metadata.disabled)?.index;

                if (firstEnabledIndex !== undefined) {
                    this.compositeRoot.setHighlightedIndex(firstEnabledIndex);
                }
                return;
            }

            this.compositeRoot.setHighlightedIndex(activeIndex);
        });

        effect(() => this.rootContext.setActivateOnFocus(this.activateOnFocus()));
    }
}

function isTabsTabMetadata(metadata: RdxCompositeMetadata): metadata is RdxCompositeMetadata<RdxTabsTabMetadata> {
    return (
        typeof metadata['disabled'] === 'boolean' &&
        typeof metadata['id'] === 'string' &&
        Object.prototype.hasOwnProperty.call(metadata, 'value')
    );
}
