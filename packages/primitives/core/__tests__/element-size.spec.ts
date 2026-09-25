import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { elementSize } from '../src/dom/element-size';

@Component({ changeDetection: ChangeDetectionStrategy.OnPush, template: '' })
class SizeHost {}

class TestResizeObserver implements ResizeObserver {
    private target: Element | undefined;

    readonly observe = vi.fn((target: Element) => {
        this.target = target;
    });
    readonly unobserve = vi.fn();
    readonly disconnect = vi.fn(() => {
        this.target = undefined;
    });

    constructor(private readonly callback: ResizeObserverCallback) {}

    resize(width: number, height: number) {
        if (!this.target) return;

        this.callback(
            [
                {
                    target: this.target,
                    borderBoxSize: [{ inlineSize: width, blockSize: height }],
                    contentBoxSize: [],
                    devicePixelContentBoxSize: [],
                    contentRect: new DOMRect(0, 0, width, height)
                }
            ],
            this
        );
    }
}

describe('elementSize', () => {
    let observer: TestResizeObserver;

    beforeEach(() => {
        vi.stubGlobal(
            'ResizeObserver',
            vi.fn(function (callback: ResizeObserverCallback) {
                observer = new TestResizeObserver(callback);
                return observer;
            })
        );
    });

    afterEach(() => {
        TestBed.resetTestingModule();
        vi.unstubAllGlobals();
    });

    async function render() {
        const fixture = TestBed.createComponent(SizeHost);
        const element: HTMLElement = fixture.nativeElement;
        const size = elementSize({
            elementRef: new ElementRef(element),
            injector: fixture.debugElement.injector
        });
        fixture.detectChanges();
        await fixture.whenStable();

        return { fixture, element, size };
    }

    it('updates an initially empty element when content appears and resizes', async () => {
        const { element, size } = await render();
        expect(size()).toEqual({ width: 0, height: 0 });

        observer.resize(10, 5);
        expect(size()).toEqual({ width: 10, height: 5 });

        observer.resize(24, 12);
        expect(size()).toEqual({ width: 24, height: 12 });
        expect(observer.observe).toHaveBeenCalledWith(element, { box: 'border-box' });
    });

    it('disconnects when its owning view is destroyed', async () => {
        const { fixture, size } = await render();
        observer.resize(10, 5);

        fixture.destroy();
        observer.resize(24, 12);

        expect(observer.disconnect).toHaveBeenCalledOnce();
        expect(size()).toEqual({ width: 10, height: 5 });
    });
});
