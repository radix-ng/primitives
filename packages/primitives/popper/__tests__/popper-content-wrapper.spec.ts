import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { autoUpdate, computePosition } from '@floating-ui/dom';
import { popperImports } from '../index';
import { RdxPopperContentWrapper } from '../src/popper-content-wrapper';

jest.mock('@floating-ui/dom', () => {
    const actual = jest.requireActual('@floating-ui/dom');

    return {
        ...actual,
        autoUpdate: jest.fn(() => jest.fn()),
        computePosition: jest.fn(() =>
            Promise.resolve({
                x: 0,
                y: 0,
                placement: 'bottom',
                strategy: 'fixed',
                middlewareData: {}
            })
        )
    };
});

@Component({
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div rdxPopperContentWrapper>
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class DefaultPopperHostComponent {}

@Component({
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div updatePositionStrategy="always" rdxPopperContentWrapper>
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class AlwaysPopperHostComponent {}

@Component({
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div [side]="side()" [updatePositionStrategy]="updatePositionStrategy()" rdxPopperContentWrapper>
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class ReactivePopperHostComponent {
    readonly side = signal<'top' | 'bottom'>('bottom');
    readonly updatePositionStrategy = signal<'optimized' | 'always'>('optimized');
}

describe('RdxPopperContentWrapper', () => {
    const autoUpdateMock = jest.mocked(autoUpdate);
    const computePositionMock = jest.mocked(computePosition);

    beforeEach(() => {
        autoUpdateMock.mockClear();
        computePositionMock.mockClear();

        TestBed.configureTestingModule({
            imports: [DefaultPopperHostComponent, AlwaysPopperHostComponent, ReactivePopperHostComponent]
        });
    });

    it('uses optimized position updates by default', async () => {
        const fixture = TestBed.createComponent(DefaultPopperHostComponent);

        fixture.detectChanges();
        await fixture.whenStable();

        const wrapper = fixture.debugElement
            .query(By.directive(RdxPopperContentWrapper))
            .injector.get(RdxPopperContentWrapper);

        expect(wrapper.updatePositionStrategy()).toBe('optimized');
        expect(autoUpdateMock).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.any(HTMLElement),
            expect.any(Function),
            {
                animationFrame: false
            }
        );
    });

    it('enables animation frame updates when explicitly requested', async () => {
        const fixture: ComponentFixture<AlwaysPopperHostComponent> = TestBed.createComponent(AlwaysPopperHostComponent);

        fixture.detectChanges();
        await fixture.whenStable();

        expect(autoUpdateMock).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.any(HTMLElement),
            expect.any(Function),
            {
                animationFrame: true
            }
        );
    });

    it('recomputes the position when an input changes in optimized mode', async () => {
        const fixture = TestBed.createComponent(ReactivePopperHostComponent);

        fixture.detectChanges();
        await fixture.whenStable();
        computePositionMock.mockClear();

        fixture.componentInstance.side.set('top');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(computePositionMock).toHaveBeenCalledTimes(1);
        expect(computePositionMock.mock.calls[0][2]).toEqual(
            expect.objectContaining({
                placement: 'top'
            })
        );
    });

    it('reconfigures auto updates when the update strategy changes', async () => {
        const cleanup = jest.fn();
        autoUpdateMock.mockReturnValueOnce(cleanup);

        const fixture = TestBed.createComponent(ReactivePopperHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        autoUpdateMock.mockClear();

        fixture.componentInstance.updatePositionStrategy.set('always');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(autoUpdateMock).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.any(HTMLElement),
            expect.any(Function),
            {
                animationFrame: true
            }
        );
    });

    it('emits placed only after the first position has been computed', async () => {
        let resolvePosition!: (value: Awaited<ReturnType<typeof computePosition>>) => void;
        computePositionMock.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolvePosition = resolve;
                })
        );

        const fixture = TestBed.createComponent(DefaultPopperHostComponent);
        fixture.detectChanges();

        const wrapper = fixture.debugElement
            .query(By.directive(RdxPopperContentWrapper))
            .injector.get(RdxPopperContentWrapper);
        const placed = jest.fn();
        wrapper.placed.subscribe(placed);

        await Promise.resolve();
        expect(placed).not.toHaveBeenCalled();

        resolvePosition({
            x: 0,
            y: 0,
            placement: 'bottom',
            strategy: 'fixed',
            middlewareData: {}
        });
        await fixture.whenStable();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(placed).toHaveBeenCalledTimes(1);
    });
});
