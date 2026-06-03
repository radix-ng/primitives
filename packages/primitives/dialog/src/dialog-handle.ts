import type { RdxDialogRootContext } from './dialog-root';
import { computed, signal } from '@angular/core';

interface RdxDialogHandleTrigger<Payload> {
    element: HTMLElement;
    payload: () => Payload | undefined;
}

/**
 * Connects a dialog root with trigger elements rendered elsewhere in the DOM, and exposes
 * imperative `open`/`close`/`toggle` methods.
 */
export class RdxDialogHandle<Payload = unknown> {
    private readonly rootContext = signal<RdxDialogRootContext | undefined>(undefined);
    private readonly triggers = new Map<string, RdxDialogHandleTrigger<Payload>>();
    private readonly rootTriggerCleanups = new Map<string, () => void>();

    readonly isOpen = computed(() => this.rootContext()?.isOpen() ?? false);

    open(triggerId: string) {
        const trigger = this.triggers.get(triggerId);

        if (!trigger) {
            throw new Error(`No dialog trigger registered with id "${triggerId}".`);
        }

        this.rootContext()?.open(
            trigger.element,
            trigger.payload(),
            triggerId,
            'imperative-action',
            new Event('dialog.open')
        );
    }

    close() {
        this.rootContext()?.close('imperative-action', new Event('dialog.close'));
    }

    toggle(triggerId: string, event = new Event('dialog.toggle')) {
        const trigger = this.triggers.get(triggerId);

        if (!trigger) {
            throw new Error(`No dialog trigger registered with id "${triggerId}".`);
        }

        this.rootContext()?.toggle(triggerId, trigger.element, trigger.payload(), event);
    }

    registerRoot(rootContext: RdxDialogRootContext) {
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

export function createRdxDialogHandle<Payload = unknown>() {
    return new RdxDialogHandle<Payload>();
}
