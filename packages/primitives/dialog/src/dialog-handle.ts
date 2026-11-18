import { computed } from '@angular/core';
import { createPopupHandleRegistry, rdxDevWarning } from '@radix-ng/primitives/core';
import type { RdxDialogRootContext } from './dialog-root';

/**
 * Connects a dialog root with trigger elements rendered elsewhere in the DOM, and exposes
 * imperative actions. Calls apply to the currently attached root.
 */
export class RdxDialogHandle<Payload = unknown> {
    private readonly registry = createPopupHandleRegistry<RdxDialogRootContext, Payload>((root, id, trigger) =>
        root.registerTrigger(id, trigger.element, trigger.payload)
    );
    readonly isOpen = computed(() => this.registry.root()?.isOpen() ?? false);

    /** Opens by registered ID, or opens without a trigger when the ID is null or unavailable. */
    open(triggerId: string | null): void {
        const root = this.registry.root();
        if (!root) return;

        const trigger = triggerId ? this.registry.trigger(triggerId) : undefined;
        if (triggerId && !trigger) {
            rdxDevWarning(
                'dialog/handle-trigger',
                `No dialog trigger registered with id "${triggerId}". Opening without a trigger.`,
                'components/dialog'
            );
        }

        root.open(
            trigger?.element,
            trigger?.payload(),
            trigger ? triggerId : null,
            'imperative-action',
            new Event('dialog.open')
        );
    }

    /** Opens with an explicit payload and without associating a trigger. */
    openWithPayload(payload: Payload): void {
        this.registry.root()?.open(undefined, payload, null, 'imperative-action', new Event('dialog.open'));
    }

    close() {
        this.registry.root()?.close('imperative-action', new Event('dialog.close'));
    }

    toggle(triggerId: string, event = new Event('dialog.toggle')) {
        const root = this.registry.root();
        if (!root) return;

        const trigger = this.registry.trigger(triggerId);

        if (!trigger) {
            throw new Error(`No dialog trigger registered with id "${triggerId}".`);
        }

        root.toggle(triggerId, trigger.element, trigger.payload(), event);
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
