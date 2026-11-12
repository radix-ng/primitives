import { computed } from '@angular/core';
import { createPopupHandleRegistry } from '@radix-ng/primitives/core';
import type { RdxInteractionType } from '@radix-ng/primitives/floating-focus-manager';
import type { RdxMenuRootContext } from './menu-root';

/** Connects a Menu to triggers declared outside its Angular injector tree. */
export class RdxMenuHandle<Payload = unknown> {
    private readonly registry = createPopupHandleRegistry<
        RdxMenuRootContext,
        Payload,
        (event: Event) => RdxInteractionType
    >((root, id, trigger) => root.registerTrigger(trigger.element, () => id, trigger.data, trigger.payload));
    readonly isOpen = computed(() => this.registry.root()?.isOpen() ?? false);

    open(triggerId: string): void {
        if (!this.registry.root()) return;
        const trigger = this.registry.trigger(triggerId);
        if (!trigger) throw new Error(`No menu trigger registered with id "${triggerId}".`);
        this.registry.root()?.show('popup', 'imperative-action', undefined, trigger.element);
    }
    close(): void {
        this.registry.root()?.close('imperative-action');
    }
    registerRoot(root: RdxMenuRootContext): () => void {
        return this.registry.registerRoot(root);
    }
    registerTrigger(
        id: string,
        element: HTMLElement,
        payload: () => Payload | undefined,
        interactionType?: (event: Event) => RdxInteractionType
    ): () => void {
        return this.registry.registerTrigger(id, element, payload, interactionType);
    }
    context(): RdxMenuRootContext | undefined {
        return this.registry.root();
    }
}

export function createRdxMenuHandle<Payload = unknown>(): RdxMenuHandle<Payload> {
    return new RdxMenuHandle<Payload>();
}
