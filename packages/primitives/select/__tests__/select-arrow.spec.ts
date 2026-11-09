import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxPopperArrow, popperImports } from '@radix-ng/primitives/popper';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _importsSelect } from '../index';

vi.mock('@floating-ui/dom', async () => ({
    ...(await vi.importActual<typeof import('@floating-ui/dom')>('@floating-ui/dom')),
    autoUpdate: vi.fn(() => vi.fn()),
    computePosition: vi.fn(async () => ({
        x: 0,
        y: 0,
        placement: 'bottom-start',
        strategy: 'fixed',
        middlewareData: { arrow: { x: 0, y: 0, centerOffset: 3 } }
    }))
}));

@Component({
    imports: [_importsSelect],
    template: `
        <ng-container [open]="open()" [modal]="false" rdxSelectRoot>
            <button rdxSelectTrigger>Fruit</button>
            <div rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div [width]="width()" [height]="height()" rdxSelectArrow></div>
                    <div rdxSelectList>
                        <div value="Apple" rdxSelectItem><span rdxSelectItemText>Apple</span></div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
class PopperHost {
    readonly open = signal(true);
    readonly width = signal(12);
    readonly height = signal(6);
}

@Component({
    imports: [_importsSelect, popperImports],
    template: `
        <div rdxPopperRoot>
            <div rdxPopperContentWrapper>
                <ng-container [open]="true" [modal]="false" defaultValue="Apple" rdxSelectRoot>
                    <button rdxSelectTrigger><span rdxSelectValue>Apple</span></button>
                    <div rdxSelectItemAlignedPosition>
                        <div rdxSelectPopup>
                            <div rdxSelectItemAlignedPositionContent>
                                <div rdxSelectArrow></div>
                                <div rdxSelectList>
                                    <div value="Apple" rdxSelectItem><span rdxSelectItemText>Apple</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </div>
        </div>
    `
})
class ItemAlignedHost {}

@Component({
    imports: [_importsSelect],
    template: `
        <ng-container [open]="true" [modal]="false" rdxSelectRoot>
            <button rdxSelectTrigger>Fruit</button>
            <div rdxSelectPositioner>
                <div rdxSelectPopup>
                    <div [width]="width()" rdxSelectArrow>
                        <svg data-custom-arrow width="18" height="9" viewBox="0 0 18 9">
                            <path d="M0 0 L9 9 L18 0 Z" />
                        </svg>
                    </div>
                    <div rdxSelectList>
                        <div value="Apple" rdxSelectItem><span rdxSelectItemText>Apple</span></div>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
class CustomArrowHost {
    readonly width = signal(12);
}

describe('Select Arrow', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'ResizeObserver',
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
        );
    });
    afterEach(() => vi.unstubAllGlobals());
    it('shares Popper geometry, zero offsets, placement state and reactive SVG dimensions', async () => {
        const fixture = TestBed.createComponent(PopperHost);
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement.querySelector('[rdxSelectArrow]');
        const svg = element.querySelector('svg')!;
        expect(element.getAttribute('aria-hidden')).toBe('true');
        expect(element.hidden).toBe(false);
        expect(element.hasAttribute('data-open')).toBe(true);
        expect(element.getAttribute('data-side')).toBe('bottom');
        expect(element.getAttribute('data-align')).toBe('start');
        expect(element.hasAttribute('data-uncentered')).toBe(true);
        expect(element.style.left).toBe('0px');
        expect(svg.style.width).toBe('12px');
        expect(svg.style.height).toBe('6px');

        fixture.componentInstance.width.set(20);
        fixture.componentInstance.height.set(10);
        fixture.componentInstance.open.set(false);
        await fixture.whenStable();
        expect(element.querySelector('svg')?.style.width).toBe('20px');
        expect(element.querySelector('svg')?.style.height).toBe('10px');
        expect(element.hasAttribute('data-open')).toBe(false);
        expect(element.hasAttribute('data-closed')).toBe(true);
    });

    it('hides in item-aligned mode without adopting an outer Popper arrow context', async () => {
        const fixture = TestBed.createComponent(ItemAlignedHost);
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement.querySelector('[rdxSelectArrow]');
        const arrow = fixture.debugElement.queryAll(By.directive(RdxPopperArrow))[0].injector.get(RdxPopperArrow);
        expect(element.hidden).toBe(true);
        expect(element.style.display).toBe('none');
        expect(element.getAttribute('data-side')).toBe('none');
        expect(element.hasAttribute('data-uncentered')).toBe(false);
        expect(element.querySelector('svg')).toBeNull();
        expect(arrow.positioningEnabled()).toBe(false);
    });

    it('projects a custom SVG and preserves it across renderer updates', async () => {
        const fixture = TestBed.createComponent(CustomArrowHost);
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement.querySelector('[rdxSelectArrow]');
        const custom = element.querySelector('[data-custom-arrow]');
        expect(custom).not.toBeNull();
        expect(element.querySelector('polygon')).toBeNull();
        fixture.componentInstance.width.set(20);
        await fixture.whenStable();
        expect(element.querySelector('[data-custom-arrow]')).toBe(custom);
        expect(element.querySelectorAll('svg')).toHaveLength(1);
    });
});
