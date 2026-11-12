import { computed } from '@angular/core';
import { createPopupHandleRegistry } from '@radix-ng/primitives/core';
import type { RdxDialogRootContext } from './dialog-root';

/**
 * Connects a dialog root with trigger elements rendered elsewhere in the DOM, and exposes
 * imperative `open`/`close`/`toggle` methods.
 */
export class RdxDialogHandle<Payload = unknown> {
    private readonly registry = createPopupHandleRegistry<RdxDialogRootContext, Payload>((root, id, trigger) =>
        root.registerTrigger(id, trigger.element, trigger.payload)
    );
    readonly isOpen = computed(() => this.registry.root()?.isOpen() ?? false);

    open(triggerId: string) {
        const trigger = this.registry.trigger(triggerId);

        if (!trigger) {
            throw new Error(`No dialog trigger registered with id "${triggerId}".`);
        }

        this.registry
            .root()
            ?.open(trigger.element, trigger.payload(), triggerId, 'imperative-action', new Event('dialog.open'));
    }

    close() {
        this.registry.root()?.close('imperative-action', new Event('dialog.close'));
    }

    toggle(triggerId: string, event = new Event('dialog.toggle')) {
        const trigger = this.registry.trigger(triggerId);

        if (!trigger) {
            throw new Error(`No dialog trigger registered with id "${triggerId}".`);
        }

        this.registry.root()?.toggle(triggerId, trigger.element, trigger.payload(), event);
    }

    registerRoot(rootContext: RdxDialogRootContext) {
        return this.registry.registerRoot(rootContext);
    }

    registerTrigger(id: string, trigger: HTMLElement, payload: () => Payload | undefined) {
        return this.registry.registerTrigger(id, trigger, payload);
    }

    context() {
        return this.registry.root();
    }
}

export function createRdxDialogHandle<Payload = unknown>() {
    return new RdxDialogHandle<Payload>();
}
