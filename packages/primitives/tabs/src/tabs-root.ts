import {
    afterRenderEffect,
    computed,
    Directive,
    effect,
    inject,
    input,
    linkedSignal,
    model,
    output,
    signal,
    untracked
} from '@angular/core';
import {
    RdxCompositeList,
    RdxCompositeListContext,
    RdxCompositeMetadata,
    RdxCompositeRootContext
} from '@radix-ng/primitives/composite';
import {
    createCancelableChangeEventDetails,
    DataOrientation,
    injectId,
    RdxCancelableChangeEventDetails
} from '@radix-ng/primitives/core';
import { provideTabsRootContext, RdxTabsRootContext } from './tabs-root-context';
import { RdxTabsActivationDirection, RdxTabsTabMetadata, RdxTabsValue } from './utils';

export type RdxTabsValueChangeReason = 'none' | 'disabled' | 'missing' | 'initial';
export type RdxTabsValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxTabsValueChangeReason> & {
    activationDirection: RdxTabsActivationDirection;
};

export interface RdxTabsValueChangeEvent {
    value: RdxTabsValue;
    eventDetails: RdxTabsValueChangeEventDetails;
}

interface TabsLayout {
    value: RdxTabsValue | undefined;
    orientation: DataOrientation;
    positions: Map<RdxTabsValue, Pick<DOMRect, 'left' | 'top'>>;
}

interface TabsDirection {
    value: RdxTabsValue | undefined;
    fromValue: RdxTabsValue | undefined;
    direction: RdxTabsActivationDirection;
    waitingForTab: boolean;
}

const rootContext = (): RdxTabsRootContext => {
    const root = inject(RdxTabsRoot);

    return {
        baseId: root.baseId,
        value: root.value,
        orientation: root.orientation,
        activationDirection: root.activationDirection,
        activateOnFocus: root.activateOnFocus.asReadonly(),
        tabListElement: root.tabListElement.asReadonly(),
        tabMap: root.tabMap.asReadonly(),
        tabCompositeRoot: root.tabCompositeRoot.asReadonly(),
        tabCompositeList: root.tabCompositeList.asReadonly(),
        setValue: (value, event, reason) => root.setValue(value, event, reason as RdxTabsValueChangeReason | undefined),
        setActivateOnFocus: (value) => root.activateOnFocus.set(value),
        registerTabList: (element, compositeRoot, compositeList) =>
            root.registerTabList(element, compositeRoot, compositeList),
        setTabMap: (map) => root.tabMap.set(map),
        getPanelId: (value) => root.getPanelId(value),
        registerPanel: (value, id) => root.registerPanel(value, id),
        getTabId: (value) => root.getTabId(value),
        registerTab: (value, id) => root.registerTab(value, id)
    };
};

/**
 * Groups the tabs and the corresponding panels.
 *
 * @see https://base-ui.com/react/components/tabs
 */
@Directive({
    selector: '[rdxTabsRoot]',
    exportAs: 'rdxTabsRoot',
    providers: [provideTabsRootContext(rootContext)],
    hostDirectives: [RdxCompositeList],
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-activation-direction]': 'activationDirection()'
    }
})
export class RdxTabsRoot {
    /** @ignore */
    readonly baseId = injectId('rdx-tabs-');

    /**
     * The value of the currently selected tab. Use together with `(onValueChange)` for controlled state.
     */
    readonly value = model<RdxTabsValue | undefined>();

    /**
     * The value of the tab that should be initially selected when uncontrolled.
     * When omitted, Base UI parity uses `0` as the implicit default and falls back to the first enabled tab.
     *
     * @default 0
     */
    readonly defaultValue = input<RdxTabsValue | undefined>(undefined);

    /**
     * The orientation the tabs are laid out. Controls arrow-key navigation
     * (left/right vs. up/down).
     *
     * @default 'horizontal'
     */
    readonly orientation = input<DataOrientation>('horizontal');

    /**
     * Event emitted when the selected tab changes.
     *
     * `eventDetails.reason` is `'none'` for user-initiated changes, `'initial'` for the first automatic
     * uncontrolled selection, `'disabled'` when an uncontrolled selection falls back from a disabled tab,
     * and `'missing'` when it falls back from a removed tab. Automatic changes are not cancelable.
     */
    readonly onValueChange = output<RdxTabsValueChangeEvent>();

    /** @ignore Set by `[rdxTabsList]`. */
    readonly activateOnFocus = signal(false);

    /** @ignore Set by `[rdxTabsList]`. */
    readonly tabListElement = signal<HTMLElement | null>(null);

    /** @ignore Set by `[rdxTabsList]`. */
    readonly tabMap = signal(new Map<HTMLElement, RdxCompositeMetadata<RdxTabsTabMetadata>>());

    /** @ignore Set by `[rdxTabsList]`. */
    readonly tabCompositeRoot = signal<RdxCompositeRootContext | null>(null);

    /** @ignore Set by `[rdxTabsList]`. */
    readonly tabCompositeList = signal<RdxCompositeListContext | null>(null);

    /** @ignore */
    readonly activationDirection = computed(() => this.direction().direction, {
        debugName: 'RdxTabsRoot.activationDirection'
    });

    private readonly tabLayout = signal<TabsLayout>(
        { value: undefined, orientation: 'horizontal', positions: new Map() },
        { debugName: 'RdxTabsRoot.tabLayout' }
    );
    private readonly direction = linkedSignal<
        { value: RdxTabsValue | undefined; orientation: DataOrientation; layout: TabsLayout },
        TabsDirection
    >({
        debugName: 'RdxTabsRoot.direction',
        source: () => ({ value: this.value(), orientation: this.orientation(), layout: this.tabLayout() }),
        computation: ({ value, orientation, layout }, previous) => {
            if (!previous) return { value, fromValue: value, direction: 'none', waitingForTab: false };
            const last = previous.value;
            if (last.value === value && !last.waitingForTab) return last;

            // A destination added with the selection may not have rendered/registered yet. Keep
            // the committed origin until its geometry exists, including through missing values.
            const fromValue = last.waitingForTab ? last.fromValue : last.value;
            if (fromValue === value) return { ...last, value, fromValue, waitingForTab: false };
            return {
                value,
                fromValue,
                direction: computeActivationDirection(fromValue, value, orientation, layout.positions),
                waitingForTab:
                    fromValue != null &&
                    value != null &&
                    (layout.value !== value || layout.orientation !== orientation || !layout.positions.has(value))
            };
        }
    });

    private readonly externallyControlled = signal(false);
    private readonly panels = signal(new Map<RdxTabsValue, { id: string; owner: object }>(), {
        debugName: 'RdxTabsRoot.panels'
    });
    private readonly tabIds = signal<readonly { value: RdxTabsValue; id: string; owner: object }[]>([], {
        debugName: 'RdxTabsRoot.tabIds'
    });
    private hasObservedValue = false;
    private previousObservedValue: RdxTabsValue | undefined;
    private internalValueCommit = false;
    private hasAppliedDefaultValue = false;
    private initialDefaultValue: RdxTabsValue | undefined;
    private shouldNotifyInitialValueChange = true;
    private shouldHonorDisabledDefaultValue = false;
    private didRegisterTabs = false;
    private lastKnownTabElement: HTMLElement | undefined;

    constructor() {
        afterRenderEffect({
            read: () =>
                this.tabLayout.set({
                    value: this.value(),
                    orientation: this.orientation(),
                    positions: measureTabs(this.tabMap())
                })
        });

        effect(() => {
            const currentValue = this.value();

            if (this.internalValueCommit) {
                this.internalValueCommit = false;
                this.hasObservedValue = true;
                this.previousObservedValue = currentValue;
                return;
            }

            if (!this.hasObservedValue) {
                this.hasObservedValue = true;
                this.previousObservedValue = currentValue;
                if (currentValue !== undefined) {
                    this.externallyControlled.set(true);
                }
                return;
            }

            if (currentValue !== this.previousObservedValue) {
                this.externallyControlled.set(true);
                this.previousObservedValue = currentValue;
            }
        });

        effect(() => {
            if (this.hasAppliedDefaultValue || untracked(this.value) !== undefined) {
                return;
            }

            const defaultValue = this.defaultValue();
            const hasExplicitDefaultValue = defaultValue !== undefined;
            this.hasAppliedDefaultValue = true;
            this.initialDefaultValue = hasExplicitDefaultValue ? defaultValue : 0;
            this.shouldNotifyInitialValueChange = !hasExplicitDefaultValue;
            this.shouldHonorDisabledDefaultValue = hasExplicitDefaultValue;
            untracked(() => this.commitValue(this.initialDefaultValue!));
        });

        effect(() => {
            const tabMap = this.tabMap();
            const value = this.value();

            if (this.externallyControlled()) {
                return;
            }

            if (tabMap.size === 0) {
                if (this.didRegisterTabs && value !== null && !this.lastKnownTabElement?.isConnected) {
                    untracked(() => this.commitAutomaticValueChange(null, 'missing'));
                }
                return;
            }

            this.didRegisterTabs = true;
            this.lastKnownTabElement = tabMap.keys().next().value;

            const selectedTabMetadata = getTabMetadataByValue(tabMap, value);
            const firstEnabledTabValue = getFirstEnabledTabValue(tabMap);
            const selectionIsDisabled = selectedTabMetadata?.disabled;
            const selectionIsMissing = selectedTabMetadata == null && value !== null;

            if (!selectionIsDisabled && value === this.initialDefaultValue) {
                this.shouldHonorDisabledDefaultValue = false;
            }

            if (this.shouldHonorDisabledDefaultValue && selectionIsDisabled && value === this.initialDefaultValue) {
                return;
            }

            const shouldNotifyInitialValueChange = this.shouldNotifyInitialValueChange;

            if (selectionIsDisabled || selectionIsMissing) {
                const fallbackValue = firstEnabledTabValue ?? null;

                if (value === fallbackValue) {
                    this.shouldNotifyInitialValueChange = false;
                    return;
                }

                let fallbackReason: RdxTabsValueChangeReason = 'missing';
                if (shouldNotifyInitialValueChange) {
                    fallbackReason = 'initial';
                } else if (selectionIsDisabled) {
                    fallbackReason = 'disabled';
                }

                untracked(() => this.commitAutomaticValueChange(fallbackValue, fallbackReason));
                return;
            }

            if (shouldNotifyInitialValueChange && selectedTabMetadata != null) {
                untracked(() => this.notifyAutomaticValueChange(value, 'initial'));
                this.shouldNotifyInitialValueChange = false;
            }
        });
    }

    /** @ignore */
    setValue(value: RdxTabsValue, event?: Event, reason: RdxTabsValueChangeReason = 'none'): void {
        const previous = this.value();
        if (previous === value) {
            return;
        }

        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails: baseEventDetails } = createCancelableChangeEventDetails(
            reason,
            event ?? new Event('tabs.value-change'),
            trigger
        );
        const eventDetails = baseEventDetails as RdxTabsValueChangeEventDetails;
        const activationDirection = computeActivationDirection(
            previous,
            value,
            this.orientation(),
            measureTabs(this.tabMap())
        );
        eventDetails.activationDirection = activationDirection;

        this.onValueChange.emit({ value, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        this.direction.set({ value, fromValue: previous, direction: activationDirection, waitingForTab: false });
        this.commitValue(value);
    }

    /** @ignore */
    getTabId(value: RdxTabsValue): string | undefined {
        const matches = this.tabIds().filter((tab) => tab.value === value);
        if (matches.length === 0) return undefined;
        // Use client DOM order when available. Native registration also works during SSR,
        // where Composite's connected-element collection has not been established.
        for (const metadata of this.tabMap().values()) {
            if (metadata.value === value && matches.some((tab) => tab.id === metadata.id)) return metadata.id;
        }
        return matches[0].id;
    }

    /** @ignore */
    registerTab(value: RdxTabsValue, id: string): () => void {
        const owner = {};
        this.tabIds.update((current) => [...current, { value, id, owner }]);
        return () => this.tabIds.update((current) => current.filter((tab) => tab.owner !== owner));
    }

    /** @ignore */
    getPanelId(value: RdxTabsValue): string | undefined {
        return this.panels().get(value)?.id;
    }

    /** @ignore */
    registerPanel(value: RdxTabsValue, id: string): () => void {
        const owner = {};
        this.panels.update((current) => new Map(current).set(value, { id, owner }));
        return () =>
            this.panels.update((current) => {
                if (current.get(value)?.owner !== owner) return current;
                const next = new Map(current);
                next.delete(value);
                return next;
            });
    }

    /** @ignore */
    registerTabList(
        element: HTMLElement,
        compositeRoot: RdxCompositeRootContext,
        compositeList: RdxCompositeListContext
    ): () => void {
        this.tabListElement.set(element);
        this.tabCompositeRoot.set(compositeRoot);
        this.tabCompositeList.set(compositeList);

        return () => {
            if (this.tabCompositeRoot() !== compositeRoot || this.tabCompositeList() !== compositeList) {
                return;
            }

            // `tabMap` is deliberately left as it is while a List is being replaced or temporarily
            // unmounted. Clearing it would make the uncontrolled-value effect treat the selected tab as
            // removed, commit `null`, and leave the remounted list without a selection. The next List
            // publishes its own map.
            this.tabListElement.set(null);
            this.tabCompositeRoot.set(null);
            this.tabCompositeList.set(null);
            this.activateOnFocus.set(false);
        };
    }

    private commitValue(value: RdxTabsValue): void {
        this.internalValueCommit = true;
        this.value.set(value);
    }

    private commitAutomaticValueChange(value: RdxTabsValue, reason: RdxTabsValueChangeReason): void {
        this.direction.set({ value, fromValue: value, direction: 'none', waitingForTab: false });
        this.commitValue(value);
        this.notifyAutomaticValueChange(value, reason);
        this.shouldNotifyInitialValueChange = false;
    }

    private notifyAutomaticValueChange(value: RdxTabsValue | undefined, reason: RdxTabsValueChangeReason): void {
        if (value === undefined) {
            return;
        }

        const { eventDetails: baseEventDetails } = createCancelableChangeEventDetails(
            reason,
            new Event('tabs.value-change')
        );
        const eventDetails = baseEventDetails as RdxTabsValueChangeEventDetails;
        eventDetails.activationDirection = 'none';
        this.onValueChange.emit({ value, eventDetails });
    }
}

function getTabMetadataByValue(
    tabMap: Map<HTMLElement, RdxCompositeMetadata<RdxTabsTabMetadata>>,
    value: RdxTabsValue | undefined
): RdxCompositeMetadata<RdxTabsTabMetadata> | undefined {
    for (const tabMetadata of tabMap.values()) {
        if (tabMetadata.value === value) {
            return tabMetadata;
        }
    }

    return undefined;
}

function getFirstEnabledTabValue(
    tabMap: Map<HTMLElement, RdxCompositeMetadata<RdxTabsTabMetadata>>
): RdxTabsValue | undefined {
    for (const tabMetadata of tabMap.values()) {
        if (!tabMetadata.disabled) {
            return tabMetadata.value;
        }
    }

    return undefined;
}

function computeActivationDirection(
    previous: RdxTabsValue | undefined,
    next: RdxTabsValue | undefined,
    orientation: DataOrientation,
    positions: TabsLayout['positions']
): RdxTabsActivationDirection {
    if (previous == null || next == null) {
        return 'none';
    }

    const previousPosition = positions.get(previous);
    const nextPosition = positions.get(next);
    if (!previousPosition || !nextPosition) {
        return previousPosition !== nextPosition
            ? inferActivationDirectionFromValues(previous, next, orientation)
            : 'none';
    }
    const axis = orientation === 'horizontal' ? 'left' : 'top';
    if (nextPosition[axis] < previousPosition[axis]) return orientation === 'horizontal' ? 'left' : 'up';
    if (nextPosition[axis] > previousPosition[axis]) return orientation === 'horizontal' ? 'right' : 'down';
    return 'none';
}

function measureTabs(tabMap: Map<HTMLElement, RdxCompositeMetadata<RdxTabsTabMetadata>>): TabsLayout['positions'] {
    const positions: TabsLayout['positions'] = new Map();
    for (const [element, metadata] of tabMap) {
        if (!positions.has(metadata.value)) positions.set(metadata.value, element.getBoundingClientRect());
    }
    return positions;
}

function inferActivationDirectionFromValues(
    previous: RdxTabsValue,
    next: RdxTabsValue,
    orientation: DataOrientation
): RdxTabsActivationDirection {
    if (previous !== next && typeof previous === 'number' && typeof next === 'number') {
        if (orientation === 'horizontal') {
            return next > previous ? 'right' : 'left';
        }

        return next > previous ? 'down' : 'up';
    }

    if (previous !== next && typeof previous === 'string' && typeof next === 'string') {
        if (orientation === 'horizontal') {
            return next > previous ? 'right' : 'left';
        }

        return next > previous ? 'down' : 'up';
    }

    return 'none';
}
