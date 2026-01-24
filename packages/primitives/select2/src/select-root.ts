import { Direction } from '@angular/cdk/bidi';
import { booleanAttribute, computed, Directive, inject, input, model, signal } from '@angular/core';
import { AcceptableValue, createContext, isNullish } from '@radix-ng/primitives/core';
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
        by: context.by,
        open: context.open,
        disabled: context.disabled,
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

    readonly dir = input<Direction>('ltr');

    /** Use this to compare objects by a particular field, or pass your own comparison function for complete control over how objects are compared. */
    readonly by = input<string | ((a: AcceptableValue, b: AcceptableValue) => boolean)>();

    readonly isEmptyModelValue = computed(() => {
        if (this.multiple() && Array.isArray(this.value())) {
            return Array(this.value())?.length === 0;
        } else {
            return isNullish(this.value());
        }
    });

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
        return Array.from(this.optionsSet()).find((option) => valueComparator(value, option.value, this.by()));
    }

    handleValueChange(value: AcceptableValue) {
        if (this.multiple()) {
            const array = Array.isArray(this.value()) ? [...Array(this.value())] : [];
            const index = array.findIndex((i) => compare(i, value, this.by()));
            index === -1 ? array.push(value) : array.splice(index, 1);
            this.value.set([...array]);
        } else {
            this.value.set(value);
        }
    }
}
