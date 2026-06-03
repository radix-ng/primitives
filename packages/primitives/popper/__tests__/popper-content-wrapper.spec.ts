import { popperImports } from '../index';
import { RdxPopperContentWrapper } from '../src/popper-content-wrapper';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { autoUpdate, computePosition } from '@floating-ui/dom';
import { vi } from 'vitest';

vi.mock('@floating-ui/dom', async () => {
    const actual = await vi.importActual<typeof import('@floating-ui/dom')>('@floating-ui/dom');

    return {
        ...actual,
        autoUpdate: vi.fn(() => vi.fn()),
        computePosition: vi.fn(() =>
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div rdxPopperContentWrapper [side]="side()" [updatePositionStrategy]="updatePositionStrategy()">
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class ReactivePopperHostComponent {
    readonly side = signal<'top' | 'bottom'>('bottom');
    readonly updatePositionStrategy = signal<'optimized' | 'always'>('optimized');
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button #customAnchor>Custom anchor</button>
            <div rdxPopperContentWrapper [anchor]="customAnchor">
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class CustomAnchorPopperHostComponent {}

describe('RdxPopperContentWrapper', () => {
    const autoUpdateMock = vi.mocked(autoUpdate);
    const computePositionMock = vi.mocked(computePosition);

    beforeEach(() => {
        autoUpdateMock.mockClear();
        computePositionMock.mockClear();

        TestBed.configureTestingModule({
            imports: [
                DefaultPopperHostComponent,
                AlwaysPopperHostComponent,
                ReactivePopperHostComponent,
                CustomAnchorPopperHostComponent
            ]
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
        const cleanup = vi.fn();
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
        const placed = vi.fn();
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

    it('positions against an explicit anchor when provided', async () => {
        const fixture = TestBed.createComponent(CustomAnchorPopperHostComponent);

        fixture.detectChanges();
        await fixture.whenStable();

        const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('button');

        expect(computePositionMock).toHaveBeenCalledWith(buttons[0], expect.any(HTMLElement), expect.any(Object));
        expect(autoUpdateMock).toHaveBeenCalledWith(buttons[0], expect.any(HTMLElement), expect.any(Function), {
            animationFrame: false
        });
    });
});
