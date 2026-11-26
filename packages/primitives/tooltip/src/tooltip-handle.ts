import { computed } from '@angular/core';
import { createPopupHandleRegistry } from '@radix-ng/primitives/core';
import type { RdxTooltipContext, RdxTooltipTriggerRegistration } from './tooltip';

/** Connects a tooltip root with trigger elements rendered elsewhere in the DOM. */
export class RdxTooltipHandle<Payload = unknown> {
    private readonly registry = createPopupHandleRegistry<RdxTooltipContext, Payload, RdxTooltipTriggerRegistration>(
        (root, id, { element, payload, data }) => root.registerTrigger(id, element, payload, data)
    );

    readonly isOpen = computed(() => this.registry.root()?.isOpen() ?? false);

    open(triggerId: string) {
        const root = this.registry.root();
        if (!root) return;

        const trigger = this.registry.trigger(triggerId);
        if (!trigger) {
            throw new Error(`No tooltip trigger registered with id "${triggerId}".`);
        }

        root.open(trigger.element, trigger.payload(), undefined, 'imperative-action');
    }

    close() {
        this.registry.root()?.close('imperative-action');
    }

    registerRoot(rootContext: RdxTooltipContext) {
        return this.registry.registerRoot(rootContext);
    }

    registerTrigger(
        id: string,
        trigger: HTMLElement,
        payload: () => Payload | undefined,
        options?: RdxTooltipTriggerRegistration
    ) {
        return this.registry.registerTrigger(id, trigger, payload, options);
    }

    context() {
        return this.registry.root();
    }
}

export function createRdxTooltipHandle<Payload = unknown>() {
    return new RdxTooltipHandle<Payload>();
}
