import { Directive, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { _IdGenerator, DataOrientation } from '@radix-ng/primitives/core';
import { provideTabsRootContext, RdxTabsRootContext } from './tabs-root-context';
import { makeTabId, RdxTabsActivationDirection, RdxTabsValue } from './utils';

const rootContext = (): RdxTabsRootContext => {
    const root = inject(RdxTabsRoot);

    return {
        baseId: root.baseId,
        value: root.value,
        orientation: root.orientation,
        activationDirection: root.activationDirection.asReadonly(),
        activateOnFocus: root.activateOnFocus.asReadonly(),
        tabListElement: root.tabListElement.asReadonly(),
        setValue: (value) => root.setValue(value),
        setActivateOnFocus: (value) => root.activateOnFocus.set(value),
        setTabListElement: (element) => root.tabListElement.set(element)
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
    host: {
        '[attr.data-orientation]': 'orientation()',
        '[attr.data-activation-direction]': 'activationDirection()'
    }
})
export class RdxTabsRoot {
    /** @ignore */
    readonly baseId = inject(_IdGenerator).getId('rdx-tabs-');

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
    readonly onValueChange = output<RdxTabsValue>();

    /** @ignore Set by `[rdxTabsList]`. */
    readonly activateOnFocus = signal(false);

    /** @ignore Set by `[rdxTabsList]`. */
    readonly tabListElement = signal<HTMLElement | null>(null);

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
    setValue(value: RdxTabsValue): void {
        const previous = this.value();
        if (previous === value) {
            return;
        }

        this.activationDirection.set(this.computeDirection(previous, value));
        this.value.set(value);
        this.onValueChange.emit(value);
    }

    private computeDirection(previous: RdxTabsValue | undefined, next: RdxTabsValue): RdxTabsActivationDirection {
        const list = this.tabListElement();
        if (!list || previous === undefined || previous === null) {
            return 'none';
        }

        const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
        const previousIndex = tabs.findIndex((tab) => tab.id === makeTabId(this.baseId, previous));
        const nextIndex = tabs.findIndex((tab) => tab.id === makeTabId(this.baseId, next));

        if (previousIndex === -1 || nextIndex === -1 || previousIndex === nextIndex) {
            return 'none';
        }

        const horizontal = this.orientation() === 'horizontal';
        if (nextIndex > previousIndex) {
            return horizontal ? 'right' : 'down';
        }

        return horizontal ? 'left' : 'up';
    }
}
