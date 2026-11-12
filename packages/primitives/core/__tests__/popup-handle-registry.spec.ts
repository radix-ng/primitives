import { signal } from '@angular/core';
import { createPopupHandleRegistry } from '../src/floating/popup-handle-registry';

describe('popup handle registration lifetimes', () => {
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
