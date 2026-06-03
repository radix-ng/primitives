import { injectRdxTooltipConfig } from './tooltip.config';
import { createTooltipInstantController } from './utils';
import { DestroyRef, Directive, inject, input, numberAttribute, Signal } from '@angular/core';
import { createContext, NumberInput } from '@radix-ng/primitives/core';

export interface RdxTooltipProviderContext {
    /** Default open delay for tooltips in this group, in milliseconds. */
    delay: Signal<number | undefined>;
    /** Default close delay for tooltips in this group, in milliseconds. */
    closeDelay: Signal<number | undefined>;
    /** Whether sibling tooltips should currently open instantly. */
    isInstant: Signal<boolean>;
    /** Notifies the group that a tooltip has opened. */
    onOpen: () => void;
    /** Notifies the group that a tooltip has closed. */
    onClose: () => void;
}

export const [injectRdxTooltipProviderContext, provideRdxTooltipProviderContext] =
    createContext<RdxTooltipProviderContext>('RdxTooltipProviderContext', 'components/tooltip');

const numberOrUndefined = (value: NumberInput | undefined) => (value == null ? undefined : numberAttribute(value));

const providerContext = (): RdxTooltipProviderContext => {
    const provider = inject(RdxTooltipProvider);

    return {
        delay: provider.delay,
        closeDelay: provider.closeDelay,
        isInstant: provider.instant.isInstant,
        onOpen: () => provider.instant.onOpen(),
        onClose: () => provider.instant.onClose()
    };
};

/**
 * Shares delay configuration and an instant-open window across a group of tooltips.
 * Once one tooltip opens, adjacent ones open instantly until `timeout` ms after the last close.
 */
@Directive({
    selector: '[rdxTooltipProvider]',
    exportAs: 'rdxTooltipProvider',
    providers: [provideRdxTooltipProviderContext(providerContext)]
})
export class RdxTooltipProvider {
    private readonly defaultConfig = injectRdxTooltipConfig();
    private readonly destroyRef = inject(DestroyRef);

    /**
     * How long to wait before opening tooltips in this group. Specified in milliseconds.
     */
    readonly delay = input<number | undefined, NumberInput | undefined>(undefined, { transform: numberOrUndefined });

    /**
     * How long to wait before closing tooltips in this group. Specified in milliseconds.
     */
    readonly closeDelay = input<number | undefined, NumberInput | undefined>(undefined, {
        transform: numberOrUndefined
    });

    /**
     * The window during which an adjacent tooltip opens instantly. Specified in milliseconds.
     */
    readonly timeout = input<number, NumberInput>(this.defaultConfig.timeout, { transform: numberAttribute });

    readonly instant = createTooltipInstantController(() => this.timeout(), this.destroyRef);
}
