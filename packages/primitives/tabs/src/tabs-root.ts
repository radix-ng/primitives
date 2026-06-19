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

export type RdxTabsValueChangeReason = 'trigger-press' | 'keyboard' | 'focus' | 'none';
export type RdxTabsValueChangeEventDetails = RdxCancelableChangeEventDetails<RdxTabsValueChangeReason>;

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
     */
    readonly defaultValue = input<RdxTabsValue>();

    /**
     * The orientation the tabs are laid out. Controls arrow-key navigation
     * (left/right vs. up/down).
     *
     * @default 'horizontal'
     */
    readonly orientation = input<DataOrientation>('horizontal');

    /**
     * Event emitted when the selected tab changes.
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

    constructor() {
        effect(() => {
            const initial = this.defaultValue();
            if (initial !== undefined && untracked(this.value) === undefined) {
                this.value.set(initial);
            }
        });
    }

    /** @ignore */
    setValue(
        value: RdxTabsValue,
        event?: Event,
        reason: RdxTabsValueChangeReason = event ? 'trigger-press' : 'none'
    ): void {
        const previous = this.value();
        if (previous === value) {
            return;
        }

        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        const { eventDetails } = createCancelableChangeEventDetails(
            reason,
            event ?? new Event('tabs.value-change'),
            trigger
        );
        this.onValueChange.emit({ value, eventDetails });
        if (eventDetails.isCanceled()) {
            return;
        }

        this.activationDirection.set(computeActivationDirection(previous, value, this.orientation(), this.tabMap()));
        this.value.set(value);
    }
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
