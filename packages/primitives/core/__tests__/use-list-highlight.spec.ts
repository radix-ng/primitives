import { ListHighlight, useListHighlight } from '../src/composables/use-list-highlight';
import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

interface Item {
    id: string;
    nav: WritableSignal<boolean>;
}

function makeItem(id: string, navigable = true): Item {
    return { id, nav: signal(navigable) };
}

function setup(
    initial: Item[],
    opts: { loop?: WritableSignal<boolean> } = {}
): {
    items: WritableSignal<readonly Item[]>;
    highlight: ListHighlight<Item>;
} {
    const items = signal<readonly Item[]>(initial);
    const highlight = TestBed.runInInjectionContext(() =>
        useListHighlight<Item>({
            items,
            isNavigable: (item) => item.nav(),
            getId: (item) => item.id,
            loop: opts.loop
        })
    );
    return { items, highlight };
}

describe('useListHighlight', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('first/last land on the boundary navigable items', () => {
        const { highlight } = setup([makeItem('a'), makeItem('b'), makeItem('c')]);
        highlight.first();
        expect(highlight.highlightedItem()?.id).toBe('a');
        highlight.last();
        expect(highlight.highlightedItem()?.id).toBe('c');
    });

    it('exposes the highlighted item id as activeId', () => {
        const { highlight } = setup([makeItem('a'), makeItem('b')]);
        expect(highlight.activeId()).toBeUndefined();
        highlight.first();
        expect(highlight.activeId()).toBe('a');
        highlight.clear();
        expect(highlight.activeId()).toBeUndefined();
    });

    it('next/previous move across navigable items', () => {
        const { highlight } = setup([makeItem('a'), makeItem('b'), makeItem('c')]);
        highlight.first();
        highlight.next();
        expect(highlight.highlightedItem()?.id).toBe('b');
        highlight.previous();
        expect(highlight.highlightedItem()?.id).toBe('a');
    });

    it('skips non-navigable (hidden/disabled) items', () => {
        const items = [makeItem('a'), makeItem('b', false), makeItem('c')];
        const { highlight } = setup(items);
        highlight.first();
        expect(highlight.highlightedItem()?.id).toBe('a');
        highlight.next();
        expect(highlight.highlightedItem()?.id).toBe('c');
    });

    it('leaves highlight null when every item is non-navigable', () => {
        const { highlight } = setup([makeItem('a', false), makeItem('b', false)]);
        highlight.first();
        expect(highlight.highlightedItem()).toBeNull();
        highlight.next();
        expect(highlight.highlightedItem()).toBeNull();
    });

    it('wraps when loop is enabled (default)', () => {
        const { highlight } = setup([makeItem('a'), makeItem('b')]);
        highlight.last();
        highlight.next();
        expect(highlight.highlightedItem()?.id).toBe('a');
        highlight.previous();
        expect(highlight.highlightedItem()?.id).toBe('b');
    });

    it('stops at the boundary when loop is disabled', () => {
        const loop = signal(false);
        const { highlight } = setup([makeItem('a'), makeItem('b')], { loop });
        highlight.last();
        highlight.next();
        expect(highlight.highlightedItem()?.id).toBe('b');
        highlight.first();
        highlight.previous();
        expect(highlight.highlightedItem()?.id).toBe('a');
    });

    it('set() ignores a non-navigable item and accepts null', () => {
        const items = [makeItem('a'), makeItem('b', false)];
        const { highlight } = setup(items);
        highlight.set(items[1]);
        expect(highlight.highlightedItem()).toBeNull();
        highlight.set(items[0]);
        expect(highlight.highlightedItem()?.id).toBe('a');
        highlight.set(null);
        expect(highlight.highlightedItem()).toBeNull();
    });

    it('self-heals when the highlighted item becomes non-navigable', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { highlight } = setup(items);
        highlight.set(items[1]);
        expect(highlight.highlightedItem()?.id).toBe('b');

        items[1].nav.set(false);
        TestBed.tick();

        expect(highlight.highlightedItem()).toBeNull();
        expect(highlight.activeId()).toBeUndefined();
    });

    it('self-heals when the highlighted item leaves the list', () => {
        const a = makeItem('a');
        const b = makeItem('b');
        const { items, highlight } = setup([a, b]);
        highlight.set(b);
        expect(highlight.highlightedItem()?.id).toBe('b');

        items.set([a]);
        TestBed.tick();

        expect(highlight.highlightedItem()).toBeNull();
    });
});
