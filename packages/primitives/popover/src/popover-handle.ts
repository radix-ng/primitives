import type { RdxPopoverRootContext } from './popover-root';
import { computed, signal } from '@angular/core';

/**
 * Connects a popover root with trigger elements rendered elsewhere in the DOM.
 */
interface RdxPopoverHandleTrigger<Payload> {
    element: HTMLElement;
    payload: () => Payload | undefined;
}

export class RdxPopoverHandle<Payload = unknown> {
    private readonly rootContext = signal<RdxPopoverRootContext | undefined>(undefined);
    private readonly triggers = new Map<string, RdxPopoverHandleTrigger<Payload>>();
    private readonly rootTriggerCleanups = new Map<string, () => void>();

    readonly isOpen = computed(() => this.rootContext()?.isOpen() ?? false);

    open(triggerId: string) {
        const trigger = this.triggers.get(triggerId);

        if (!trigger) {
            throw new Error(`No popover trigger registered with id "${triggerId}".`);
        }

        this.rootContext()?.open(
            trigger.element,
            trigger.payload(),
            triggerId,
            'imperative-action',
            new Event('popover.open')
        );
    }

    close() {
        this.rootContext()?.close('imperative-action', new Event('popover.close'));
    }

    toggle(triggerId: string, event = new Event('popover.toggle')) {
        const trigger = this.triggers.get(triggerId);

        if (!trigger) {
            throw new Error(`No popover trigger registered with id "${triggerId}".`);
        }

        this.rootContext()?.toggle(triggerId, trigger.element, trigger.payload(), event);
    }

    registerRoot(rootContext: RdxPopoverRootContext) {
        this.rootContext.set(rootContext);
        this.triggers.forEach((trigger, id) => {
            this.rootTriggerCleanups.set(id, rootContext.registerTrigger(id, trigger.element, trigger.payload));
        });

        return () => {
            if (this.rootContext() === rootContext) {
                this.rootTriggerCleanups.forEach((cleanup) => cleanup());
                this.rootTriggerCleanups.clear();
                this.rootContext.set(undefined);
            }
        };
    }

    registerTrigger(id: string, trigger: HTMLElement, payload: () => Payload | undefined) {
        this.rootTriggerCleanups.get(id)?.();
        this.triggers.set(id, { element: trigger, payload });
        const unregisterFromRoot = this.rootContext()?.registerTrigger(id, trigger, payload);

        if (unregisterFromRoot) {
            this.rootTriggerCleanups.set(id, unregisterFromRoot);
        }

        return () => {
            this.rootTriggerCleanups.get(id)?.();
            this.rootTriggerCleanups.delete(id);

            if (this.triggers.get(id)?.element === trigger) {
                this.triggers.delete(id);
            }
        };
    }

    context() {
        return this.rootContext();
    }
}

export function createRdxPopoverHandle<Payload = unknown>() {
    return new RdxPopoverHandle<Payload>();
}
