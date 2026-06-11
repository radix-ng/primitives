import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    inject,
    input,
    model,
    output,
    signal,
    untracked
} from '@angular/core';
import {
    AcceptableValue,
    createContext,
    Direction,
    isNullish,
    ItemValueComparator,
    useTransitionStatus
} from '@radix-ng/primitives/core';
import { RdxPopper } from '@radix-ng/primitives/popper';
import { compare, valueComparator } from './utils';

export interface SelectOption {
    value: any;
    disabled?: boolean;
    textContent: string;
}

const context = () => {
    const context = inject(RdxSelectRoot);

    return {
        triggerElement: context.triggerElement,
        valueElement: context.valueElement,
        triggerPointerDownPosRef: context.triggerPointerDownPosRef,
        contentId: '',
        dir: context.dir,
        value: context.value,
        multiple: context.multiple,
        isItemEqualToValue: context.isItemEqualToValue,
        itemToStringLabel: context.itemToStringLabel,
        open: context.open,
        disabled: context.disabled,
        modal: context.modal,
        isEmptyModelValue: context.isEmptyModelValue,
        transitionStatus: context.transitionStatus,
        registerTransitionElement: context.registerTransitionElement,
        optionsSet: context.optionsSet,
        onOptionAdd: (option: any) => {
            const existingOption = context.getOption(option());
            if (existingOption) {
                context.optionsSet().delete(existingOption);
            }

            context.optionsSet().add(option());
        },
        onOptionRemove: (option: any) => {
            const existingOption = context.getOption(option());
            if (existingOption) {
                context.optionsSet().delete(existingOption);
            }
        },
        onValueChange: context.handleValueChange,
        onTriggerChange: (node: any) => {
            context.triggerElement.set(node.nativeElement);
        },
        onValueElementChange: (node: any) => {
            context.valueElement.set(node);
        },
        onOpenChange: (value: any) => {
            context.open.set(value);
        }
    };
};

export type RdxSelectRootContext = ReturnType<typeof context>;

export const [injectSelectRootContext, provideSelectRootContext] =
    createContext<RdxSelectRootContext>('RdxSelectRootContext');

@Directive({
    selector: '[rdxSelectRoot]',
    exportAs: 'rdxSelectRoot',
    providers: [provideSelectRootContext(context)],
    hostDirectives: [RdxPopper]
})
export class RdxSelectRoot {
    readonly open = model<boolean>(false);

    readonly value = model<AcceptableValue | AcceptableValue[]>();

    readonly multiple = input(false, { transform: booleanAttribute });

    readonly disabled = input(false, { transform: booleanAttribute });

    /** Whether the popup is modal: locks page scroll and makes outside content inert while open. */
    readonly modal = input(true, { transform: booleanAttribute });

    readonly dir = input<Direction>('ltr');

    /** How item values are compared for equality — a function `(a, b) => boolean` or an object key. */
    readonly isItemEqualToValue = input<ItemValueComparator<AcceptableValue>>();

    /** Converts a value to its display label (used by `RdxSelectValue`). */
    readonly itemToStringLabel = input<(value: AcceptableValue) => string>();

    /** Emits after the open/close transition (including any exit animation) finishes. */
    readonly onOpenChangeComplete = output<boolean>();

    private readonly transition = useTransitionStatus((open) => this.onOpenChangeComplete.emit(open));

    /** Open/close transition phase, for `data-starting-style` / `data-ending-style`. */
    readonly transitionStatus = this.transition.status;

    /** Registers the popup element whose animation determines transition completion. */
    readonly registerTransitionElement = this.transition.registerElement;

    readonly isEmptyModelValue = computed(() => {
        const value = this.value();
        if (this.multiple() && Array.isArray(value)) {
            return value.length === 0;
        }
        return isNullish(value);
    });

    constructor() {
        let previousOpen = untracked(this.open);
        effect(() => {
            const open = this.open();
            if (open === previousOpen) {
                return;
            }
            previousOpen = open;
            untracked(() => this.transition.start(open));
        });
    }

    readonly optionsSet = signal<Set<SelectOption>>(new Set());

    // The native `select` only associates the correct default value if the corresponding
    // `option` is rendered as a child **at the same time** as itself.
    // Because it might take a few renders for our items to gather the information to build
    // the native `option`(s), we generate a key on the `select` to make sure Vue re-builds it
    // each time the options change.
    readonly nativeSelectKey = computed(() => {
        return Array.from(this.optionsSet())
            .map((option) => option.value)
            .join(';');
    });

    readonly triggerElement = signal<HTMLElement | null>(null);
    readonly valueElement = signal<HTMLElement | null>(null);
    readonly triggerPointerDownPosRef = signal<{ x: number; y: number } | null>({
        x: 0,
        y: 0
    });

    getOption(value: SelectOption['value']) {
        return Array.from(this.optionsSet()).find((option) =>
            valueComparator(value, option.value, this.isItemEqualToValue())
        );
    }

    handleValueChange(value: AcceptableValue) {
        if (this.multiple()) {
            const current = this.value();
            const array = Array.isArray(current) ? [...current] : [];
            const index = array.findIndex((i) => compare(i, value, this.isItemEqualToValue()));
            index === -1 ? array.push(value) : array.splice(index, 1);
            this.value.set([...array]);
        } else {
            this.value.set(value);
        }
    }
}
