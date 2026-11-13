import { signal } from '@angular/core';
import { createPopupHandleRegistry } from '../src/floating/popup-handle-registry';

describe('popup handle registration lifetimes', () => {
    it('restores surviving owners in attachment order with the latest trigger and payload', () => {
        const registrations = new Map<object, Map<string, string>>();
        const connect = vi.fn((owner: object, id: string, trigger: { payload: () => string | undefined }) => {
            const connected = registrations.get(owner) ?? new Map<string, string>();
            registrations.set(owner, connected);
            connected.set(id, trigger.payload()!);
            return () => connected.delete(id);
        });
        const registry = createPopupHandleRegistry<object, string>(connect);
        const first = {},
            second = {},
            third = {};
        const oldTrigger = registry.registerTrigger('row', document.createElement('button'), () => 'old');
        const removeFirst = registry.registerRoot(first);
        const removeSecond = registry.registerRoot(second);
        const removeThird = registry.registerRoot(third);
        registry.registerTrigger('row', document.createElement('button'), () => 'updated');
        oldTrigger();
        removeThird();
        expect(registry.root()).toBe(second);
        expect(registrations.get(second)?.get('row')).toBe('updated');
        expect(registrations.get(third)?.size).toBe(0);
        // Cleanup is scoped to its registration, including repeated destruction notifications.
        removeThird();
        expect(registry.root()).toBe(second);
        removeSecond();
        expect(registry.root()).toBe(first);
        expect(registrations.get(first)?.get('row')).toBe('updated');
        removeFirst();
        expect(registry.root()).toBeUndefined();
        for (const connected of registrations.values()) expect(connected.size).toBe(0);
    });

    it('connects triggers declared before the root and reads current application payloads', () => {
        const value = signal('first');
        const disconnect = vi.fn();
        const connect = vi.fn(() => disconnect);
        const registry = createPopupHandleRegistry<object, string>(connect);
        const element = document.createElement('button');
        registry.registerTrigger('row', element, value);
        const root = {};
        const unregister = registry.registerRoot(root);
        expect(connect).toHaveBeenCalledWith(root, 'row', expect.objectContaining({ element }));
        value.set('updated');
        expect(registry.trigger('row')?.payload()).toBe('updated');
        unregister();
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(registry.root()).toBeUndefined();
        expect(registry.trigger('row')?.element).toBe(element);
    });

    it('a stale trigger cleanup cannot unregister a replacement with the same id', () => {
        const cleanups: ReturnType<typeof vi.fn>[] = [];
        const registry = createPopupHandleRegistry<object, string>(() => {
            const cleanup = vi.fn();
            cleanups.push(cleanup);
            return cleanup;
        });
        registry.registerRoot({});
        const first = registry.registerTrigger('row', document.createElement('button'), () => 'first');
        const replacement = document.createElement('button');
        const second = registry.registerTrigger('row', replacement, () => 'second');
        first();
        expect(registry.trigger('row')?.element).toBe(replacement);
        expect(cleanups[0]).toHaveBeenCalledTimes(1);
        expect(cleanups[1]).not.toHaveBeenCalled();
        second();
        expect(cleanups[1]).toHaveBeenCalledTimes(1);
    });

    it('switches root connections without letting an old root cleanup detach the current owner', () => {
        const cleanups: ReturnType<typeof vi.fn>[] = [];
        const registry = createPopupHandleRegistry<object, string>(() => {
            const cleanup = vi.fn();
            cleanups.push(cleanup);
            return cleanup;
        });
        registry.registerTrigger('row', document.createElement('button'), () => 'row');
        const first = registry.registerRoot({});
        const owner = {};
        const second = registry.registerRoot(owner);
        first();
        expect(registry.root()).toBe(owner);
        expect(cleanups[0]).toHaveBeenCalledTimes(1);
        expect(cleanups[1]).not.toHaveBeenCalled();
        second();
        expect(cleanups[1]).toHaveBeenCalledTimes(1);
    });
});
