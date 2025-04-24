import { computed, signal, Signal } from '@angular/core';

export interface PrimitiveElementController {
    primitiveElement: {
        (): HTMLElement | null;
        set: (el: HTMLElement | null) => void;
    };
    currentElement: Signal<HTMLElement | null>;
}

export function usePrimitiveElement(): PrimitiveElementController {
    const primitiveElement = signal<HTMLElement | null>(null);

    const currentElement = computed<HTMLElement | null>(() => {
        const el = primitiveElement();
        if (!el) return null;
        const name = el.nodeName.toLowerCase();
        if (name === '#text' || name === '#comment') {
            return el.nextElementSibling as HTMLElement | null;
        }
        return el;
    });

    return { primitiveElement, currentElement };
}
