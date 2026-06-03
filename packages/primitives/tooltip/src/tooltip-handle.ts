import type { RdxTooltipContext } from './tooltip';
import { computed, signal } from '@angular/core';

/**
 * Connects a tooltip root with trigger elements rendered elsewhere in the DOM.
 */
interface RdxTooltipHandleTrigger<Payload> {
    element: HTMLElement;
    payload: () => Payload | undefined;
}

export class RdxTooltipHandle<Payload = unknown> {
    private readonly rootContext = signal<RdxTooltipContext | undefined>(undefined);
    private readonly triggers = new Map<string, RdxTooltipHandleTrigger<Payload>>();
    private readonly rootTriggerCleanups = new Map<string, () => void>();

    readonly isOpen = computed(() => this.rootContext()?.isOpen() ?? false);

    open(triggerId: string) {
        const trigger = this.triggers.get(triggerId);

        if (!trigger) {
            throw new Error(`No tooltip trigger registered with id "${triggerId}".`);
        }

        this.rootContext()?.open(trigger.element, trigger.payload());
    }

    close() {
        this.rootContext()?.close();
    }

    registerRoot(rootContext: RdxTooltipContext) {
        this.rootContext.set(rootContext);
        this.triggers.forEach((trigger, id) => {
            this.rootTriggerCleanups.set(id, rootContext.registerTrigger(trigger.element));
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
        const unregisterFromRoot = this.rootContext()?.registerTrigger(trigger);

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

export function createRdxTooltipHandle<Payload = unknown>() {
    return new RdxTooltipHandle<Payload>();
}
