import { createContext } from '../src/create-context';
import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface FooContext {
    value: number;
}

function inject<T>(fn: () => T): T {
    return TestBed.runInInjectionContext(fn);
}

describe('createContext', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('provides the value produced by the factory and injects it back', () => {
        const [injectFoo, provideFoo] = createContext<FooContext>('Foo');
        TestBed.configureTestingModule({ providers: [provideFoo(() => ({ value: 42 }))] });

        expect(inject(() => injectFoo())).toEqual({ value: 42 });
    });

    it('treats the context as a singleton — the factory runs once per injector', () => {
        const [injectFoo, provideFoo] = createContext<FooContext>('Foo');
        const factory = vi.fn(() => ({ value: 1 }));
        TestBed.configureTestingModule({ providers: [provideFoo(factory)] });

        const first = inject(() => injectFoo());
        const second = inject(() => injectFoo());

        expect(first).toBe(second);
        expect(factory).toHaveBeenCalledTimes(1);
    });

    it('throws a descriptive, primitive-named error when required but not provided', () => {
        const [injectFoo] = createContext<FooContext>('Foo');
        TestBed.configureTestingModule({ providers: [] });

        // Our own message, not Angular's generic NullInjectorError.
        expect(() => inject(() => injectFoo())).toThrow(/No `FooContext` found/);
        expect(() => inject(() => injectFoo(false))).toThrow(/must be placed inside the directive/);
    });

    it('normalizes a description that already ends in `Context`', () => {
        const [injectFoo] = createContext<FooContext>('FooRootContext');
        TestBed.configureTestingModule({ providers: [] });

        // `FooRootContext`, not `FooRootContextContext`.
        expect(() => inject(() => injectFoo())).toThrow(/No `FooRootContext` found/);
    });

    it('appends a documentation link to the error when a docs path is given', () => {
        const [injectFoo] = createContext<FooContext>('Foo', 'components/foo');
        TestBed.configureTestingModule({ providers: [] });

        expect(() => inject(() => injectFoo())).toThrow(/See https:\/\/radix-ng\.com\/components\/foo\.md/);
    });

    it('omits the documentation link when no docs path is given', () => {
        const [injectFoo] = createContext<FooContext>('Foo');
        TestBed.configureTestingModule({ providers: [] });

        expect(() => inject(() => injectFoo())).not.toThrow(/radix-ng\.com/);
        expect(() => inject(() => injectFoo())).toThrow(/No `FooContext` found/);
    });

    it('throws the same descriptive error when a provided factory yields null and the context is required', () => {
        const [injectFoo, provideFoo] = createContext<FooContext>('Foo');
        TestBed.configureTestingModule({ providers: [provideFoo(() => null as unknown as FooContext)] });

        expect(() => inject(() => injectFoo())).toThrow(/No `FooContext` found/);
    });

    it('returns null instead of throwing when optional and not provided', () => {
        const [injectFoo] = createContext<FooContext>('Foo');
        TestBed.configureTestingModule({ providers: [] });

        expect(inject(() => injectFoo(true))).toBeNull();
    });

    it('returns the value when optional and the context is provided', () => {
        const [injectFoo, provideFoo] = createContext<FooContext>('Foo');
        TestBed.configureTestingModule({ providers: [provideFoo(() => ({ value: 7 }))] });

        expect(inject(() => injectFoo(true))).toEqual({ value: 7 });
    });

    it('isolates each context behind its own token', () => {
        const [injectA, provideA] = createContext<number>('A');
        const [injectB, provideB] = createContext<number>('B');
        TestBed.configureTestingModule({ providers: [provideA(() => 1), provideB(() => 2)] });

        expect(inject(() => injectA())).toBe(1);
        expect(inject(() => injectB())).toBe(2);
    });

    it('resolves the nearest provider in a hierarchical injector', () => {
        const [injectFoo, provideFoo] = createContext<FooContext>('Foo');
        TestBed.configureTestingModule({ providers: [provideFoo(() => ({ value: 1 }))] });

        const parent = TestBed.inject(Injector);
        const child = Injector.create({
            providers: [provideFoo(() => ({ value: 2 }))],
            parent
        });

        expect(runInInjectionContext(parent, () => injectFoo())).toEqual({ value: 1 });
        expect(runInInjectionContext(child, () => injectFoo())).toEqual({ value: 2 });
    });
});
