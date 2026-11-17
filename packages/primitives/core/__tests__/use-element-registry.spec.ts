import { Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { useElementRegistry } from '../src/composables/use-element-registry';

interface Item {
    element: HTMLElement;
    label: string;
}

@Component({ template: '<div></div>' })
class RegistryHost {
    readonly registry = useElementRegistry<Item>();
}

describe('element registry', () => {
    let fixture: ComponentFixture<RegistryHost>;
    let container: HTMLElement;
    let registry: RegistryHost['registry'];
    const item = (label: string): Item => {
        const element = document.createElement('button');
        element.textContent = label;
        container.appendChild(element);
        return { element, label };
    };

    beforeEach(async () => {
        fixture = TestBed.createComponent(RegistryHost);
        TestBed.tick();
        await fixture.whenStable();
        registry = fixture.componentInstance.registry;
        container = fixture.nativeElement.querySelector('div');
    });
    afterEach(() => fixture.destroy());

    it('orders registrations by native position rather than registration order', () => {
        const first = item('first'),
            second = item('second'),
            third = item('third');
        registry.register(third);
        registry.register(first);
        registry.register(second);
        expect(registry.items()).toEqual([first, second, third]);
        expect(registry.indexOf(third.element)).toBe(2);
    });

    it('keeps the new owner when a previous registration cleans up', () => {
        const previous = item('previous');
        const removePrevious = registry.register(previous);
        const next = { ...previous, label: 'next' };
        const removeNext = registry.register(next);
        removePrevious();
        registry.unregister(previous);
        expect(registry.items()).toEqual([next]);
        removeNext();
        expect(registry.items()).toEqual([]);
    });

    it('updates metadata without invalidating native indices or losing the original cleanup', () => {
        const original = item('first');
        const remove = registry.register(original);
        const elements = registry.elements();
        const updated = { ...original, label: 'updated' };
        expect(registry.update(updated)).toBe(true);
        expect(registry.items()).toEqual([updated]);
        expect(registry.elements()).toBe(elements);
        expect(registry.indexOf(original.element)).toBe(0);
        remove();
        expect(registry.items()).toEqual([]);
        expect(registry.update(updated)).toBe(false);
    });

    it('ignores a stale cleanup even when the same owner registers twice', () => {
        const entry = item('same owner');
        const previousCleanup = registry.register(entry);
        const currentCleanup = registry.register(entry);
        previousCleanup();
        expect(registry.items()).toEqual([entry]);
        currentCleanup();
        expect(registry.items()).toEqual([]);
    });

    it('publishes a new owner after a batched remove/register with identical native order', () => {
        const previous = item('previous');
        const remove = registry.register(previous);
        expect(registry.items()).toEqual([previous]);
        const elements = registry.elements();
        remove();
        const next = { ...previous, label: 'next' };
        registry.register(next);
        expect(registry.items()).toEqual([next]);
        expect(registry.elements()).toBe(elements);
    });

    it('keeps reactive metadata separate from collection order', () => {
        const label = signal('first');
        const entry = item('first');
        registry.register(entry);
        const metadata = computed(() => registry.items().map(() => label()));
        const elements = registry.elements();
        expect(metadata()).toEqual(['first']);
        label.set('renamed');
        expect(metadata()).toEqual(['renamed']);
        expect(registry.elements()).toBe(elements);
    });

    it('observes wrapper moves without re-registration or an Angular render', async () => {
        const first = item('first'),
            second = item('second');
        const wrapper = document.createElement('section');
        container.insertBefore(wrapper, first.element);
        wrapper.appendChild(first.element);
        registry.register(first);
        registry.register(second);
        expect(registry.items()).toEqual([first, second]);
        TestBed.tick();
        await fixture.whenStable();
        container.appendChild(wrapper);
        await new Promise((resolve) => setTimeout(resolve));
        expect(registry.items()).toEqual([second, first]);
    });

    it('detects connection after an early read and observes later native moves', async () => {
        const first = item('first'),
            second = item('second');
        const wrapper = document.createElement('section');
        wrapper.append(first.element, second.element);
        registry.register(first);
        registry.register(second);
        expect(registry.items()).toEqual([]);
        container.appendChild(wrapper);
        TestBed.tick();
        await fixture.whenStable();
        expect(registry.items()).toEqual([first, second]);
        wrapper.prepend(second.element);
        await new Promise((resolve) => setTimeout(resolve));
        expect(registry.items()).toEqual([second, first]);
    });

    it('removes a disconnected item and restores it when it reconnects', async () => {
        const entry = item('only');
        registry.register(entry);
        expect(registry.items()).toEqual([entry]);
        TestBed.tick();
        await fixture.whenStable();
        entry.element.remove();
        await new Promise((resolve) => setTimeout(resolve));
        expect(registry.items()).toEqual([]);
        container.appendChild(entry.element);
        await new Promise((resolve) => setTimeout(resolve));
        expect(registry.items()).toEqual([entry]);
    });

    it('clears registrations on owner disposal and ignores late cleanups', () => {
        const entry = item('only');
        const remove = registry.register(entry);
        expect(registry.items()).toEqual([entry]);
        fixture.destroy();
        remove();
        registry.refresh();
        registry.register(entry);
        expect(registry.items()).toEqual([]);
    });
});
