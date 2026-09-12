import { ChangeDetectionStrategy, Component, computed, Directive, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { autoUpdate, computePosition } from '@floating-ui/dom';
import { Direction } from '@radix-ng/primitives/core';
import { vi } from 'vitest';
import { popperImports } from '../index';
import { provideRdxPopperContentWrapper, RdxPopperContentWrapper } from '../src/popper-content-wrapper';
import { provideRdxPopperContentConfig } from '../src/popper-content.config';
import {
    Align,
    OffsetFunction,
    RdxCollisionAvoidance,
    resolvePhysicalSide,
    SideOrLogical,
    toLogicalSide
} from '../src/utils';

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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button #customAnchor>Custom anchor</button>
            <div [anchor]="customAnchor" rdxPopperContentWrapper>
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class CustomAnchorPopperHostComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div [side]="side()" [dir]="dir()" rdxPopperContentWrapper>
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class LogicalSidePopperHostComponent {
    readonly side = signal<SideOrLogical>('inline-start');
    readonly dir = signal<Direction | undefined>(undefined);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div
                [collisionAvoidance]="collisionAvoidance()"
                [avoidCollisions]="avoidCollisions()"
                [side]="side()"
                [align]="align()"
                [sideOffset]="sideOffset()"
                [alignOffset]="alignOffset()"
                rdxPopperContentWrapper
            >
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class CollisionPopperHostComponent {
    readonly collisionAvoidance = signal<RdxCollisionAvoidance | undefined>(undefined);
    readonly avoidCollisions = signal(true);
    readonly side = signal<SideOrLogical>('bottom');
    readonly align = signal<Align>('center');
    readonly sideOffset = signal<number | OffsetFunction>(0);
    readonly alignOffset = signal<number | OffsetFunction>(0);
}

// Applies a DROPDOWN-style config preset on the wrapper element (mirrors what a real positioner does
// via `provideRdxPopperContentConfig`), so the preset-vs-input resolution can be exercised.
@Directive({
    selector: '[testDropdownConfig]',
    providers: [provideRdxPopperContentConfig({ collisionAvoidance: { fallbackAxisSide: 'none' } })]
})
class TestDropdownConfigDirective {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports, TestDropdownConfigDirective],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div
                [collisionAvoidance]="collisionAvoidance()"
                [avoidCollisions]="avoidCollisions()"
                testDropdownConfig
                rdxPopperContentWrapper
            >
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class PresetPopperHostComponent {
    readonly collisionAvoidance = signal<RdxCollisionAvoidance | undefined>(undefined);
    readonly avoidCollisions = signal(true);
}

// A positioner subclass whose `positioningActive` gate is toggleable via an input — mirrors how the
// menu positioner pauses positioning while a keep-mounted popup is closed.
@Directive({
    selector: '[testGatedPositioner]',
    providers: [...provideRdxPopperContentWrapper(TestGatedPositioner)]
})
class TestGatedPositioner extends RdxPopperContentWrapper {
    readonly gate = input(true);

    constructor() {
        super();
        this.positioningActive = computed(() => this.gate());
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports, TestGatedPositioner],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div [gate]="active()" updatePositionStrategy="always" testGatedPositioner>
                <div rdxPopperContent>Content</div>
            </div>
        </div>
    `
})
class GatedPositionerHostComponent {
    readonly active = signal(true);
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div rdxPopperContentWrapper>
                <div rdxPopperContent>
                    Content
                    <span rdxPopperArrow></span>
                </div>
            </div>
        </div>
    `
})
class ArrowPopperHostComponent {}

// Same anatomy as `ArrowPopperHostComponent`, but with a reactive `side` input — used to trigger a
// `position` resource reload (a params change) and inspect the arrow's geometry mid-recompute.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [popperImports],
    template: `
        <div rdxPopperRoot>
            <button rdxPopperAnchor>Anchor</button>
            <div [side]="side()" rdxPopperContentWrapper>
                <div rdxPopperContent>
                    Content
                    <span rdxPopperArrow></span>
                </div>
            </div>
        </div>
    `
})
class ReactiveArrowPopperHostComponent {
    readonly side = signal<'top' | 'bottom'>('bottom');
}

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
                CustomAnchorPopperHostComponent,
                CollisionPopperHostComponent,
                PresetPopperHostComponent,
                GatedPositionerHostComponent,
                LogicalSidePopperHostComponent,
                ArrowPopperHostComponent,
                ReactiveArrowPopperHostComponent
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

    describe('logical sides (Base UI parity)', () => {
        // `renderPlaced` swaps the computePosition implementation; restore the module default
        // (`mockClear` in the outer beforeEach clears calls, not implementations).
        afterEach(() => {
            computePositionMock.mockImplementation(() =>
                Promise.resolve({ x: 0, y: 0, placement: 'bottom', strategy: 'fixed', middlewareData: {} })
            );
        });

        it('resolves inline-start/inline-end to physical sides for the direction', () => {
            expect(resolvePhysicalSide('inline-start', false)).toBe('left');
            expect(resolvePhysicalSide('inline-end', false)).toBe('right');
            expect(resolvePhysicalSide('inline-start', true)).toBe('right');
            expect(resolvePhysicalSide('inline-end', true)).toBe('left');
        });

        it('passes physical sides through unchanged in both directions', () => {
            for (const side of ['top', 'bottom', 'left', 'right'] as const) {
                expect(resolvePhysicalSide(side, false)).toBe(side);
                expect(resolvePhysicalSide(side, true)).toBe(side);
            }
        });

        it('reports a rendered side logically only when the requested side was logical (toLogicalSide)', () => {
            // Logical request → left/right rendered side maps back to logical, by direction.
            expect(toLogicalSide('inline-start', 'left', false)).toBe('inline-start');
            expect(toLogicalSide('inline-start', 'right', false)).toBe('inline-end'); // flipped
            expect(toLogicalSide('inline-start', 'left', true)).toBe('inline-end');
            expect(toLogicalSide('inline-end', 'right', true)).toBe('inline-start');
            // top/bottom rendered side and physical requests pass through.
            expect(toLogicalSide('inline-start', 'top', false)).toBe('top');
            expect(toLogicalSide('left', 'right', false)).toBe('right');
            expect(toLogicalSide('bottom', 'bottom', true)).toBe('bottom');
        });

        it('positions a logical inline-start on the left in LTR and flips to the right in RTL', async () => {
            const fixture = TestBed.createComponent(LogicalSidePopperHostComponent);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(computePositionMock.mock.calls.at(-1)![2]).toEqual(expect.objectContaining({ placement: 'left' }));

            computePositionMock.mockClear();
            fixture.componentInstance.dir.set('rtl');
            fixture.detectChanges();
            await fixture.whenStable();

            expect(computePositionMock.mock.calls.at(-1)![2]).toEqual(expect.objectContaining({ placement: 'right' }));
        });

        // `data-side` / `placedSide()` echo the requested kind (Base UI positioner `side`); the
        // physical side stays available separately for internal geometry (`physicalPlacedSide`).
        async function renderPlaced(placement: 'left' | 'right' | 'bottom', dir?: Direction) {
            computePositionMock.mockImplementation(() =>
                Promise.resolve({ x: 0, y: 0, placement, strategy: 'fixed' as const, middlewareData: {} })
            );

            const fixture = TestBed.createComponent(LogicalSidePopperHostComponent);
            if (dir) {
                fixture.componentInstance.dir.set(dir);
            }
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(RdxPopperContentWrapper));

            return {
                fixture,
                wrapper: debugElement.injector.get(RdxPopperContentWrapper),
                element: debugElement.nativeElement as HTMLElement
            };
        }

        it('reports data-side logically when a logical side was requested, keeping the physical side internally', async () => {
            const { element, wrapper } = await renderPlaced('left');

            expect(element.getAttribute('data-side')).toBe('inline-start');
            expect(wrapper.placedSide()).toBe('inline-start');
            expect(wrapper.physicalPlacedSide()).toBe('left');
        });

        it('keeps data-side logical after a collision flip and maps it by direction', async () => {
            // LTR inline-start flipped onto the physical right edge → the logical opposite.
            const flipped = await renderPlaced('right');
            expect(flipped.element.getAttribute('data-side')).toBe('inline-end');

            // RTL: the physical right edge IS the reading-start edge.
            const rtl = await renderPlaced('right', 'rtl');
            expect(rtl.element.getAttribute('data-side')).toBe('inline-start');
            expect(rtl.wrapper.physicalPlacedSide()).toBe('right');
        });

        it('reports data-side physically for a physical request (unchanged contract)', async () => {
            const { fixture, element } = await renderPlaced('left');
            fixture.componentInstance.side.set('left');
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(element.getAttribute('data-side')).toBe('left');
        });
    });

    describe('collision avoidance (Base UI parity)', () => {
        type Middleware = { name: string; options: any };

        /** Latest middleware array handed to `computePosition`, with the falsy (disabled) slots removed. */
        function lastMiddleware(): Middleware[] {
            const call = computePositionMock.mock.calls.at(-1)!;
            return ((call[2] as any).middleware as (Middleware | false | undefined)[]).filter(Boolean) as Middleware[];
        }

        function byName(name: string): Middleware | undefined {
            return lastMiddleware().find((m) => m.name === name);
        }

        async function render(setup?: (host: CollisionPopperHostComponent) => void) {
            const fixture = TestBed.createComponent(CollisionPopperHostComponent);
            setup?.(fixture.componentInstance);
            fixture.detectChanges();
            await fixture.whenStable();
            return fixture;
        }

        it('applies flip + shift with the Base UI defaults (flip / flip / end)', async () => {
            await render();

            const flip = byName('flip');
            const shift = byName('shift');

            expect(flip?.options).toEqual(
                expect.objectContaining({ mainAxis: true, crossAxis: 'alignment', fallbackAxisSideDirection: 'end' })
            );
            expect(shift?.options).toEqual(expect.objectContaining({ mainAxis: true }));
        });

        it('disables both flip and shift when the deprecated avoidCollisions is false', async () => {
            await render((host) => host.avoidCollisions.set(false));

            expect(byName('flip')).toBeUndefined();
            expect(byName('shift')).toBeUndefined();
        });

        it('omits flip when collisionAvoidance.side is none but keeps shift', async () => {
            await render((host) => host.collisionAvoidance.set({ side: 'none' }));

            expect(byName('flip')).toBeUndefined();
            expect(byName('shift')?.options).toEqual(expect.objectContaining({ mainAxis: true }));
        });

        it('omits shift when align is none and side stays flip', async () => {
            await render((host) => host.collisionAvoidance.set({ align: 'none' }));

            expect(byName('shift')).toBeUndefined();
            expect(byName('flip')?.options).toEqual(expect.objectContaining({ crossAxis: false }));
        });

        it('maps fallbackAxisSide none (DROPDOWN preset) onto flip', async () => {
            await render((host) => host.collisionAvoidance.set({ fallbackAxisSide: 'none' }));

            expect(byName('flip')?.options).toEqual(expect.objectContaining({ fallbackAxisSideDirection: 'none' }));
        });

        it('runs shift before flip for center alignment, flip before shift otherwise', async () => {
            await render((host) => host.align.set('center'));
            let names = lastMiddleware().map((m) => m.name);
            expect(names.indexOf('shift')).toBeLessThan(names.indexOf('flip'));

            await render((host) => host.align.set('start'));
            names = lastMiddleware().map((m) => m.name);
            expect(names.indexOf('flip')).toBeLessThan(names.indexOf('shift'));
        });

        // Findings 1 & 4: config preset (DROPDOWN) resolution.
        async function renderPreset(setup?: (host: PresetPopperHostComponent) => void) {
            const fixture = TestBed.createComponent(PresetPopperHostComponent);
            setup?.(fixture.componentInstance);
            fixture.detectChanges();
            await fixture.whenStable();
            return fixture;
        }

        it('applies the config preset when the consumer passes nothing (fallbackAxisSide: none)', async () => {
            await renderPreset();

            expect(byName('flip')?.options).toEqual(expect.objectContaining({ fallbackAxisSideDirection: 'none' }));
        });

        it('honors the deprecated avoidCollisions=false even when a preset is provided (finding 1)', async () => {
            await renderPreset((host) => host.avoidCollisions.set(false));

            expect(byName('flip')).toBeUndefined();
            expect(byName('shift')).toBeUndefined();
        });

        it('lets a consumer object fully replace the preset — omitted fields use global defaults (finding 4)', async () => {
            // Preset is `{ fallbackAxisSide: 'none' }`; the consumer object omits it, so it must fall back
            // to the global default `end`, NOT leak the preset's `none`.
            await renderPreset((host) => host.collisionAvoidance.set({ side: 'shift' }));

            expect(byName('flip')?.options).toEqual(expect.objectContaining({ fallbackAxisSideDirection: 'end' }));
        });
    });

    describe('positioning gate (keep-mounted, finding 2)', () => {
        it('skips computePosition + autoUpdate while positioningActive is false, resumes when true', async () => {
            const fixture = TestBed.createComponent(GatedPositionerHostComponent);
            fixture.componentInstance.active.set(false);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(autoUpdateMock).not.toHaveBeenCalled();
            expect(computePositionMock).not.toHaveBeenCalled();

            fixture.componentInstance.active.set(true);
            fixture.detectChanges();
            await fixture.whenStable();

            expect(autoUpdateMock).toHaveBeenCalled();
        });
    });

    describe('offset functions (Base UI parity)', () => {
        function lastOffsetFn(): OffsetFunction {
            const call = computePositionMock.mock.calls.at(-1)!;
            const offset = ((call[2] as any).middleware as any[]).filter(Boolean).find((m) => m?.name === 'offset');
            return offset.options as OffsetFunction;
        }

        const state = {
            placement: 'bottom' as const,
            rects: { reference: { width: 120, height: 40 }, floating: { width: 200, height: 80 } }
        };

        async function render(setup?: (host: CollisionPopperHostComponent) => void) {
            const fixture = TestBed.createComponent(CollisionPopperHostComponent);
            setup?.(fixture.componentInstance);
            fixture.detectChanges();
            await fixture.whenStable();
            return fixture;
        }

        it('resolves a numeric sideOffset onto the main axis', async () => {
            await render((host) => host.sideOffset.set(8));

            expect((lastOffsetFn() as any)(state)).toEqual(
                expect.objectContaining({ mainAxis: 8, crossAxis: 0, alignmentAxis: 0 })
            );
        });

        it('invokes a sideOffset function with the anchor / positioner dimensions and placement', async () => {
            const sideOffset = vi.fn(({ anchor }) => anchor.width);
            await render((host) => host.sideOffset.set(sideOffset as OffsetFunction));

            const result = (lastOffsetFn() as any)(state);

            expect(sideOffset).toHaveBeenCalledWith({
                side: 'bottom',
                align: 'center',
                anchor: { width: 120, height: 40 },
                positioner: { width: 200, height: 80 }
            });
            expect(result.mainAxis).toBe(120);
        });

        it('applies an alignOffset function to both cross and alignment axes', async () => {
            await render((host) => host.alignOffset.set((({ anchor }) => anchor.height) as OffsetFunction));

            const result = (lastOffsetFn() as any)(state);

            expect(result.crossAxis).toBe(40);
            expect(result.alignmentAxis).toBe(40);
        });

        it('reports the placed side logically to the offset function when a logical side was requested', async () => {
            const sideOffset = vi.fn(() => 0);
            await render((host) => {
                host.side.set('inline-start');
                host.sideOffset.set(sideOffset as OffsetFunction);
            });

            // Not flipped: physical left → inline-start (LTR).
            (lastOffsetFn() as any)({ ...state, placement: 'left' });
            expect(sideOffset).toHaveBeenLastCalledWith(expect.objectContaining({ side: 'inline-start' }));

            // Flipped to the physical right edge: a logical request stays logical → inline-end (LTR).
            (lastOffsetFn() as any)({ ...state, placement: 'right' });
            expect(sideOffset).toHaveBeenLastCalledWith(expect.objectContaining({ side: 'inline-end' }));
        });
    });

    // ADR 0002: the arrow no longer hides itself when the popup is shifted off-center — only a
    // genuinely hidden anchor (the `hide` middleware's `referenceHidden`) hides it, inherited from the
    // positioner. `data-uncentered` moved onto `RdxPopperArrow` itself so every consumer gets it.
    describe('RdxPopperArrow (ADR 0002 — uncentered stays visible)', () => {
        let originalResizeObserver: typeof ResizeObserver | undefined;

        beforeAll(() => {
            originalResizeObserver = globalThis.ResizeObserver;
            Object.defineProperty(globalThis, 'ResizeObserver', {
                configurable: true,
                value: class {
                    observe() {}
                    disconnect() {}
                }
            });
        });

        afterAll(() => {
            Object.defineProperty(globalThis, 'ResizeObserver', {
                configurable: true,
                value: originalResizeObserver
            });
        });

        afterEach(() => {
            computePositionMock.mockImplementation(() =>
                Promise.resolve({ x: 0, y: 0, placement: 'bottom', strategy: 'fixed', middlewareData: {} })
            );
        });

        async function render() {
            const fixture = TestBed.createComponent(ArrowPopperHostComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
            return fixture;
        }

        it('keeps the arrow visible and marks it data-uncentered when the popup is shifted off-center', async () => {
            computePositionMock.mockImplementation(() =>
                Promise.resolve({
                    x: 0,
                    y: 0,
                    placement: 'bottom',
                    strategy: 'fixed',
                    middlewareData: { arrow: { x: 12, y: 0, centerOffset: 8 } }
                })
            );

            const fixture = await render();
            const arrow: HTMLElement = fixture.nativeElement.querySelector('[rdxPopperArrow]');

            expect(arrow.getAttribute('data-uncentered')).toBe('');
            expect(arrow.style.visibility).toBe('');
        });

        // Codex review finding: a `0` coordinate is legitimate (Floating UI clamps the arrow to the
        // padded edge of the popup, e.g. `arrowPadding: 0`, most likely exactly when it is off-center).
        // A truthy check on `arrowX`/`arrowY` would drop `0` and leave that axis unset — harmless while
        // the arrow was hidden whenever off-center, but a real mispositioning now that it stays visible.
        it('still positions the arrow on an axis clamped to exactly 0', async () => {
            computePositionMock.mockImplementation(() =>
                Promise.resolve({
                    x: 0,
                    y: 0,
                    placement: 'bottom',
                    strategy: 'fixed',
                    middlewareData: { arrow: { x: 0, y: 0, centerOffset: 8 } }
                })
            );

            const fixture = await render();
            const arrow: HTMLElement = fixture.nativeElement.querySelector('[rdxPopperArrow]');

            expect(arrow.style.left).toBe('0px');
            expect(arrow.style.top).toBe('0px');
        });

        it('omits data-uncentered when the arrow is centered', async () => {
            computePositionMock.mockImplementation(() =>
                Promise.resolve({
                    x: 0,
                    y: 0,
                    placement: 'bottom',
                    strategy: 'fixed',
                    middlewareData: { arrow: { x: 12, y: 0, centerOffset: 0 } }
                })
            );

            const fixture = await render();
            const arrow: HTMLElement = fixture.nativeElement.querySelector('[rdxPopperArrow]');

            expect(arrow.hasAttribute('data-uncentered')).toBe(false);
        });

        it('still hides the popup (and with it the arrow) when the anchor is fully hidden', async () => {
            computePositionMock.mockImplementation(() =>
                Promise.resolve({
                    x: 0,
                    y: 0,
                    placement: 'bottom',
                    strategy: 'fixed',
                    middlewareData: { hide: { referenceHidden: true } }
                })
            );

            const fixture = await render();
            const wrapper: HTMLElement = fixture.nativeElement.querySelector('[rdxPopperContentWrapper]');
            const arrow: HTMLElement = fixture.nativeElement.querySelector('[rdxPopperArrow]');

            expect(wrapper.hasAttribute('data-anchor-hidden')).toBe(true);
            expect(wrapper.style.visibility).toBe('hidden');
            // The arrow sets no visibility of its own — it disappears because it inherits from the
            // hidden positioner, not because it was individually hidden.
            expect(arrow.style.visibility).toBe('');
        });

        // Codex review finding: the `position` resource resets `value()` to `undefined` while a reload
        // is in flight (e.g. every pointer move while a tooltip tracks the cursor, or here, a `side`
        // change). Before ADR 0002 that window was masked by `visibility: hidden` (an off-center
        // `centerOffset` reads as `undefined !== 0` too); now that the arrow stays visible throughout,
        // its geometry must keep showing the last resolved position instead of flashing to an
        // untransformed / re-centered state.
        it('keeps showing the last resolved arrow geometry while a reload is in flight', async () => {
            computePositionMock.mockImplementationOnce(() =>
                Promise.resolve({
                    x: 0,
                    y: 0,
                    placement: 'bottom',
                    strategy: 'fixed',
                    middlewareData: { arrow: { x: 12, y: 0, centerOffset: 8 } }
                })
            );

            const fixture = TestBed.createComponent(ReactiveArrowPopperHostComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();

            const arrow: HTMLElement = fixture.nativeElement.querySelector('[rdxPopperArrow]');
            expect(arrow.getAttribute('data-uncentered')).toBe('');
            expect(arrow.style.left).toBe('12px');
            const transformBeforeReload = arrow.style.transform;
            expect(transformBeforeReload).not.toBe('');

            // A `side` change reloads the position resource; hold the new `computePosition` call
            // pending so the resource's transient `value() === undefined` window is observable.
            let resolvePending!: (value: Awaited<ReturnType<typeof computePosition>>) => void;
            computePositionMock.mockImplementationOnce(() => new Promise((resolve) => (resolvePending = resolve)));

            fixture.componentInstance.side.set('top');
            fixture.detectChanges();
            await Promise.resolve();

            expect(arrow.getAttribute('data-uncentered')).toBe('');
            expect(arrow.style.left).toBe('12px');
            expect(arrow.style.transform).toBe(transformBeforeReload);

            resolvePending({
                x: 0,
                y: 0,
                placement: 'top',
                strategy: 'fixed',
                middlewareData: { arrow: { x: 12, y: 0, centerOffset: 8 } }
            });
            await fixture.whenStable();
        });
    });
});
