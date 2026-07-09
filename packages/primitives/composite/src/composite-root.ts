import {
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    model,
    output
} from '@angular/core';
import { BooleanInput, createContext, Direction } from '@radix-ng/primitives/core';
import { injectDirection } from '@radix-ng/primitives/direction-provider';
import { RdxCompositeList } from './composite-list';
import {
    RdxCompositeMetadata,
    RdxCompositeModifierKey,
    RdxCompositeOrientation,
    RdxCompositeRootContext
} from './types';
import {
    ACTIVE_COMPOSITE_ITEM,
    ARROW_KEYS,
    COMPOSITE_KEYS,
    findNonDisabledListIndex,
    getCompositeNavigationKeys,
    getMaxListIndex,
    getMinListIndex,
    isElementDisabled,
    isIndexOutOfListBounds,
    isListIndexDisabled,
    isModifierKeySet,
    isNativeTextInput,
    scrollIntoViewIfNeeded,
    shouldKeepNativeTextInputBehavior
} from './utils';

const rootContext = (): RdxCompositeRootContext => {
    const root = inject(RdxCompositeRoot);

    return {
        rootElement: root.elementRef.nativeElement,
        highlightedIndex: root.highlightedIndex.asReadonly(),
        highlightItemOnHover: root.highlightItemOnHover,
        orientation: root.orientation,
        dir: root.dir,
        isIndexDisabled: (index) => root.isIndexDisabled(index),
        setHighlightedIndex: (index, shouldScrollIntoView) => root.setHighlightedIndex(index, shouldScrollIntoView),
        relayKeyboardEvent: (event) => root.relayKeyboardEvent(event)
    };
};

export const [injectRdxCompositeRootContext, provideRdxCompositeRootContext] = createContext<RdxCompositeRootContext>(
    'RdxCompositeRootContext',
    'utils/composite'
);

/**
 * Internal Base UI-style composite root for roving index and arrow-key navigation.
 */
@Directive({
    selector: '[rdxCompositeRoot]',
    exportAs: 'rdxCompositeRoot',
    hostDirectives: [RdxCompositeList],
    providers: [provideRdxCompositeRootContext(rootContext)],
    host: {
        '(keydown)': 'handleKeydown($event)',
        '(focusin)': 'handleFocusIn($event)'
    }
})
export class RdxCompositeRoot {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly compositeList = inject(RdxCompositeList, { self: true });
    private hasSetInitialIndex = false;

    /** The composite orientation. */
    readonly orientationInput = input<RdxCompositeOrientation>('both', { alias: 'orientation' });
    private readonly _orientation = linkedSignal(() => this.orientationInput());
    readonly orientation = this._orientation.asReadonly();

    /** Text direction for horizontal arrow-key navigation. */
    readonly dirInput = input<Direction | undefined>(undefined, { alias: 'dir' });
    private readonly effectiveDir = injectDirection(this.dirInput);
    private readonly _dir = linkedSignal(() => this.effectiveDir());
    readonly dir = this._dir.asReadonly();

    /** Whether arrow-key navigation wraps at the first/last item. */
    readonly loopFocusInput = input<boolean, BooleanInput>(true, {
        alias: 'loopFocus',
        transform: booleanAttribute
    });
    private readonly _loopFocus = linkedSignal(() => this.loopFocusInput());
    readonly loopFocus = this._loopFocus.asReadonly();

    /** Enables Home and End keys. */
    readonly enableHomeAndEndKeysInput = input<boolean, BooleanInput>(false, {
        alias: 'enableHomeAndEndKeys',
        transform: booleanAttribute
    });
    private readonly _enableHomeAndEndKeys = linkedSignal(() => this.enableHomeAndEndKeysInput());
    readonly enableHomeAndEndKeys = this._enableHomeAndEndKeys.asReadonly();

    /** Indices that are skipped by keyboard navigation. */
    readonly disabledIndicesInput = input<readonly number[] | undefined>(undefined, { alias: 'disabledIndices' });
    private readonly _disabledIndices = linkedSignal(() => this.disabledIndicesInput());
    readonly disabledIndices = this._disabledIndices.asReadonly();

    /** Modifier keys that should not block composite navigation. */
    readonly modifierKeysInput = input<readonly RdxCompositeModifierKey[]>([], { alias: 'modifierKeys' });
    private readonly _modifierKeys = linkedSignal(() => this.modifierKeysInput());
    readonly modifierKeys = this._modifierKeys.asReadonly();

    /** Whether hovering an item should focus it. */
    readonly highlightItemOnHover = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /** Whether handled navigation keys stop propagation. */
    readonly stopEventPropagation = input<boolean, BooleanInput>(true, { transform: booleanAttribute });

    /** The currently highlighted item index. */
    readonly highlightedIndex = model<number>(0);

    /** Emits when this root changes the highlighted index. */
    readonly onHighlightedIndexChange = output<number>();

    /** Emits when the ordered item map changes. */
    readonly onMapChange = output<Map<HTMLElement, RdxCompositeMetadata>>();

    readonly items = this.compositeList.items;

    readonly itemMap = this.compositeList.itemMap;

    constructor() {
        effect(() => {
            const items = this.items();
            if (items.length === 0) {
                return;
            }

            if (!this.hasSetInitialIndex) {
                this.hasSetInitialIndex = true;

                const activeIndex = items.findIndex((item) => item.element.hasAttribute(ACTIVE_COMPOSITE_ITEM));
                if (activeIndex !== -1) {
                    this.setHighlightedIndex(activeIndex, true);
                    return;
                }

                // Initial pass: move the tab stop off a disabled default item. The DOM disabled /
                // aria-disabled fallback is intentionally allowed here (Base UI init parity).
                this.moveHighlightOffDisabledItem();
                return;
            }

            // Re-validation after the initial pass. `disabledIndices` can resolve a render late (e.g.
            // Toolbar derives it from item metadata), leaving the tab stop on a now-disabled item. Gated
            // on `disabledIndices` being provided, so composites relying on the DOM disabled fallback keep
            // their index untouched (Base UI's `disabledIndices == null` skip in useCompositeRoot).
            //
            // Deliberate divergence from Base UI's second gate (`externalHighlightedIndex != null`):
            // Angular's `model()` cannot distinguish a controlled `[(highlightedIndex)]` from an
            // uncontrolled one, so when `disabledIndices` IS provided this re-validation also applies to a
            // controlled index — a consumer that both controls the index and passes `disabledIndices` may
            // see it corrected and written back through the binding. That combination is contradictory,
            // and moving to the first enabled item keeps a reachable tab stop.
            if (this.disabledIndices() != null) {
                this.moveHighlightOffDisabledItem();
            }
        });

        effect(() => {
            this.onMapChange.emit(this.itemMap());
        });
    }

    /** Move the roving tab stop to the first enabled item when the highlighted one is disabled. */
    private moveHighlightOffDisabledItem(): void {
        if (!this.isIndexDisabled(this.highlightedIndex())) {
            return;
        }

        const elements = this.elements();
        const firstEnabledIndex = getMinListIndex(elements, this.disabledIndices());
        if (!isIndexOutOfListBounds(elements, firstEnabledIndex)) {
            this.setHighlightedIndex(firstEnabledIndex);
        }
    }

    indexOf(element: HTMLElement): number {
        return this.compositeList.indexOf(element);
    }

    setOrientation(value: RdxCompositeOrientation): void {
        this._orientation.set(value);
    }

    setLoopFocus(value: boolean): void {
        this._loopFocus.set(value);
    }

    setDir(value: Direction): void {
        this._dir.set(value);
    }

    setEnableHomeAndEndKeys(value: boolean): void {
        this._enableHomeAndEndKeys.set(value);
    }

    setDisabledIndices(value: readonly number[] | undefined): void {
        this._disabledIndices.set(value);
    }

    setModifierKeys(value: readonly RdxCompositeModifierKey[]): void {
        this._modifierKeys.set(value);
    }

    isIndexDisabled(index: number): boolean {
        return isListIndexDisabled(this.elements(), index, this.disabledIndices());
    }

    setHighlightedIndex(index: number, shouldScrollIntoView = false): void {
        if (this.highlightedIndex() !== index) {
            this.highlightedIndex.set(index);
            this.onHighlightedIndexChange.emit(index);
        }

        if (shouldScrollIntoView) {
            scrollIntoViewIfNeeded(
                this.elementRef.nativeElement,
                this.elements()[index],
                this.dir(),
                this.orientation()
            );
        }
    }

    relayKeyboardEvent(event: KeyboardEvent): void {
        this.handleCompositeKeydown(event, true);
    }

    protected handleKeydown(event: KeyboardEvent): void {
        this.handleCompositeKeydown(event, false);
    }

    /** Select the whole value when focus lands on a native text input item (Base UI parity). */
    protected handleFocusIn(event: FocusEvent): void {
        const target = event.target;

        if (isNativeTextInput(target)) {
            target.setSelectionRange(0, target.value.length);
        }
    }

    private handleCompositeKeydown(event: KeyboardEvent, relayed: boolean): void {
        const relevantKeys = this.enableHomeAndEndKeys() ? COMPOSITE_KEYS : ARROW_KEYS;

        if (!relevantKeys.has(event.key) || isModifierKeySet(event, this.modifierKeys())) {
            return;
        }

        const target = event.target;
        const rootElement = this.elementRef.nativeElement;

        if (!relayed && target instanceof HTMLElement) {
            const closestRoot = target.closest('[rdxCompositeRoot]');
            if (closestRoot && closestRoot !== rootElement) {
                return;
            }
        }

        if (isNativeTextInput(target) && !isElementDisabled(target)) {
            try {
                if (shouldKeepNativeTextInputBehavior(event, target, this.orientation(), this.dir())) {
                    return;
                }
            } catch {
                return;
            }
        }

        const elements = this.elements();
        if (elements.length === 0) {
            return;
        }

        const nextIndex = this.getNextIndex(event, elements);

        if (nextIndex === this.highlightedIndex() || isIndexOutOfListBounds(elements, nextIndex)) {
            return;
        }

        if (this.stopEventPropagation()) {
            event.stopPropagation();
        }

        event.preventDefault();
        this.setHighlightedIndex(nextIndex, true);

        queueMicrotask(() => {
            this.elements()[nextIndex]?.focus();
        });
    }

    private getNextIndex(event: KeyboardEvent, elements: HTMLElement[]): number {
        const highlightedIndex = this.highlightedIndex();
        const minIndex = getMinListIndex(elements, this.disabledIndices());
        const maxIndex = getMaxListIndex(elements, this.disabledIndices());

        if (this.enableHomeAndEndKeys()) {
            if (event.key === 'Home') {
                return minIndex;
            }

            if (event.key === 'End') {
                return maxIndex;
            }
        }

        const { forwardKeys, backwardKeys } = getCompositeNavigationKeys(this.orientation(), this.dir());
        const isForward = forwardKeys.includes(event.key);
        const isBackward = backwardKeys.includes(event.key);

        if (!isForward && !isBackward) {
            return highlightedIndex;
        }

        const decrement = isBackward;
        const boundaryIndex = decrement ? minIndex : maxIndex;
        const loopIndex = decrement ? maxIndex : minIndex;

        if (this.loopFocus() && highlightedIndex === boundaryIndex) {
            return loopIndex;
        }

        return findNonDisabledListIndex(elements, {
            startingIndex: highlightedIndex,
            decrement,
            disabledIndices: this.disabledIndices()
        });
    }

    private elements(): HTMLElement[] {
        return this.compositeList.elements();
    }
}
