import { Directive, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { RdxCompositeList, RdxCompositeMetadata } from '@radix-ng/primitives/composite';
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

const rootContext = (): RdxTabsRootContext => {
    const root = inject(RdxTabsRoot);

    return {
        baseId: root.baseId,
        value: root.value,
        orientation: root.orientation,
        activationDirection: root.activationDirection.asReadonly(),
        activateOnFocus: root.activateOnFocus.asReadonly(),
        tabListElement: root.tabListElement.asReadonly(),
        tabMap: root.tabMap.asReadonly(),
        setValue: (value, event, reason) => root.setValue(value, event, reason as RdxTabsValueChangeReason | undefined),
        setActivateOnFocus: (value) => root.activateOnFocus.set(value),
        setTabListElement: (element) => root.tabListElement.set(element),
        setTabMap: (map) => root.tabMap.set(map)
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

    /** @ignore */
    readonly activationDirection = signal<RdxTabsActivationDirection>('none');

    private readonly externallyControlled = signal(false);
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
            this.initialDefaultValue = defaultValue ?? 0;
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
        const activationDirection = computeActivationDirection(previous, value, this.orientation(), this.tabMap());
        eventDetails.activationDirection = activationDirection;

        this.onValueChange.emit({ value, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        this.activationDirection.set(activationDirection);
        this.commitValue(value);
    }

    private commitValue(value: RdxTabsValue): void {
        this.internalValueCommit = true;
        this.value.set(value);
    }

    private commitAutomaticValueChange(value: RdxTabsValue, reason: RdxTabsValueChangeReason): void {
        this.activationDirection.set('none');
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
    next: RdxTabsValue,
    orientation: DataOrientation,
    tabMap: Map<HTMLElement, RdxCompositeMetadata<RdxTabsTabMetadata>>
): RdxTabsActivationDirection {
    if (previous == null || next == null) {
        return 'none';
    }

    let previousTab: HTMLElement | null = null;
    let nextTab: HTMLElement | null = null;
    let previousIndex = -1;
    let nextIndex = -1;

    for (const [tabElement, tabMetadata] of tabMap.entries()) {
        if (tabMetadata.value === previous) {
            previousTab = tabElement;
            previousIndex = tabMetadata.index;
        }
        if (tabMetadata.value === next) {
            nextTab = tabElement;
            nextIndex = tabMetadata.index;
        }
        if (previousTab && nextTab) {
            break;
        }
    }

    if (!previousTab || !nextTab || previousIndex === nextIndex) {
        return inferActivationDirectionFromValues(previous, next, orientation);
    }

    const previousRect = previousTab.getBoundingClientRect();
    const nextRect = nextTab.getBoundingClientRect();

    if (orientation === 'horizontal') {
        if (nextRect.left < previousRect.left) {
            return 'left';
        }
        if (nextRect.left > previousRect.left) {
            return 'right';
        }
        return nextIndex > previousIndex ? 'right' : 'left';
    }

    if (nextRect.top < previousRect.top) {
        return 'up';
    }
    if (nextRect.top > previousRect.top) {
        return 'down';
    }
    return nextIndex > previousIndex ? 'down' : 'up';
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
