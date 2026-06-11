import { Directive, inject, model, output, Signal } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface RdxMenuRadioGroupContext {
    value: Signal<string | undefined>;
    selectValue: (value: string) => void;
}

export const [injectRdxMenuRadioGroupContext, provideRdxMenuRadioGroupContext] =
    createContext<RdxMenuRadioGroupContext>('RdxMenuRadioGroupContext', 'components/menu');

const radioGroupContextFactory = (): RdxMenuRadioGroupContext => {
    const instance = inject(RdxMenuRadioGroup);
    return {
        value: instance.value,
        selectValue: (v) => instance.selectValue(v)
    };
};

/**
 * Groups radio items in a menu.
 */
@Directive({
    selector: '[rdxMenuRadioGroup]',
    exportAs: 'rdxMenuRadioGroup',
    providers: [provideRdxMenuRadioGroupContext(radioGroupContextFactory)],
    host: {
        role: 'group'
    }
})
export class RdxMenuRadioGroup {
    /**
     * The currently selected value.
     */
    readonly value = model<string | undefined>(undefined);

    /**
     * Emits when the selected value changes.
     */
    readonly onValueChange = output<string>();

    selectValue(newValue: string): void {
        this.value.set(newValue);
        this.onValueChange.emit(newValue);
    }
}
