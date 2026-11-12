import { computed } from '@angular/core';
import { createPopupHandleRegistry } from '@radix-ng/primitives/core';
import type { RdxPopoverRootContext } from './popover-root';

/**
 * Connects a popover root with trigger elements rendered elsewhere in the DOM.
 */

export class RdxPopoverHandle<Payload = unknown> {
    private readonly registry = createPopupHandleRegistry<RdxPopoverRootContext, Payload>((root, id, trigger) =>
        root.registerTrigger(id, trigger.element, trigger.payload)
    );
    readonly isOpen = computed(() => this.registry.root()?.isOpen() ?? false);

    open(triggerId: string) {
        const trigger = this.registry.trigger(triggerId);

        if (!trigger) {
            throw new Error(`No popover trigger registered with id "${triggerId}".`);
        }

        this.registry
            .root()
            ?.open(trigger.element, trigger.payload(), triggerId, 'imperative-action', new Event('popover.open'));
    }

    close() {
        this.registry.root()?.close('imperative-action', new Event('popover.close'));
    }

    toggle(triggerId: string, event = new Event('popover.toggle')) {
        const trigger = this.registry.trigger(triggerId);

        if (!trigger) {
            throw new Error(`No popover trigger registered with id "${triggerId}".`);
        }

        this.registry.root()?.toggle(triggerId, trigger.element, trigger.payload(), event);
    }

    registerRoot(rootContext: RdxPopoverRootContext) {
        return this.registry.registerRoot(rootContext);
    }

    registerTrigger(id: string, trigger: HTMLElement, payload: () => Payload | undefined) {
        return this.registry.registerTrigger(id, trigger, payload);
    }

    context() {
        return this.registry.root();
    }
}

export function createRdxPopoverHandle<Payload = unknown>() {
    return new RdxPopoverHandle<Payload>();
}
