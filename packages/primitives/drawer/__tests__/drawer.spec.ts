import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    createRdxDrawerHandle,
    drawerImports,
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerIndentBackground,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerPortalMisuseGuard,
    RdxDrawerProvider,
    RdxDrawerProviderDirective,
    RdxDrawerRoot,
    RdxDrawerSnapPoint,
    RdxDrawerSwipeArea,
    RdxDrawerTitle,
    RdxDrawerTrigger,
    RdxDrawerViewport,
    RdxDrawerVirtualKeyboardProvider
} from '@radix-ng/primitives/drawer';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerSwipeArea,
        RdxDrawerPortal,
        RdxDrawerBackdrop,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose
    ],
    template: `
        <div
            [(open)]="open"
            [modal]="modal"
            [swipeDirection]="swipeDirection"
            (onOpenChange)="changes.push($event.reason)"
            rdxDrawerRoot
        >
            <button rdxDrawerTrigger>Open</button>
            <div rdxDrawerSwipeArea></div>

            <ng-template rdxDrawerPortal>
                <div rdxDrawerBackdrop></div>
                <div rdxDrawerPopup>
                    <h2 rdxDrawerTitle>Title</h2>
                    <p rdxDrawerDescription>Description</p>
                    <div rdxDrawerContent>Body</div>
                    <button rdxDrawerClose>Close</button>
                </div>
            </ng-template>
        </div>
    `
})
class TestHostComponent {
    open = false;
    modal: boolean | 'trap-focus' = true;
    swipeDirection: 'up' | 'down' | 'left' | 'right' = 'down';
    readonly changes: string[] = [];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxDrawerTrigger, RdxDrawerRoot, RdxDrawerPortal, RdxDrawerPopup],
    template: `
        <button id="detached" [handle]="handle" rdxDrawerTrigger>Open</button>
        <div [handle]="handle" rdxDrawerRoot>
            <ng-template rdxDrawerPortal>
                <div rdxDrawerPopup>Popup</div>
            </ng-template>
        </div>
    `
})
class DetachedHostComponent {
    readonly handle = createRdxDrawerHandle();
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxDrawerRoot, RdxDrawerTrigger, RdxDrawerPortal, RdxDrawerPopup],
    template: `
        <div
            [(open)]="open"
            [(snapPoint)]="snapPoint"
            [snapPoints]="snapPoints"
            [defaultSnapPoint]="defaultSnapPoint"
            (onSnapPointChange)="changed.push($event)"
            rdxDrawerRoot
        >
            <button rdxDrawerTrigger>Open</button>
            <ng-template rdxDrawerPortal>
                <div rdxDrawerPopup>Body</div>
            </ng-template>
        </div>
    `
})
class SnapHostComponent {
    open = false;
    snapPoints: RdxDrawerSnapPoint[] = ['160px', 0.5, 1];
    defaultSnapPoint: RdxDrawerSnapPoint | undefined = undefined;
    snapPoint: RdxDrawerSnapPoint | null = null;
    readonly changed: RdxDrawerSnapPoint[] = [];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxDrawerProviderDirective, RdxDrawerIndentBackground, RdxDrawerRoot, RdxDrawerPortal, RdxDrawerPopup],
    template: `
        <div rdxDrawerProvider>
            <div id="indent" rdxDrawerIndentBackground></div>

            <div [(open)]="outer" rdxDrawerRoot>
                <ng-template rdxDrawerPortal>
                    <div data-testid="outer" rdxDrawerPopup>
                        <div [(open)]="inner" rdxDrawerRoot>
                            <ng-template rdxDrawerPortal>
                                <div data-testid="inner" rdxDrawerPopup>
                                    <div [(open)]="deep" rdxDrawerRoot>
                                        <ng-template rdxDrawerPortal>
                                            <div data-testid="deep" rdxDrawerPopup>Deep</div>
                                        </ng-template>
                                    </div>
                                </div>
                            </ng-template>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class NestedHostComponent {
    outer = false;
    inner = false;
    deep = false;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxDrawerRoot, RdxDrawerSwipeArea, RdxDrawerPortal, RdxDrawerBackdrop, RdxDrawerViewport, RdxDrawerPopup],
    template: `
        <div #portalContainer data-testid="portal-container">
            <div [modal]="false" swipeDirection="right" rdxDrawerRoot>
                <div data-testid="swipe-area" rdxDrawerSwipeArea></div>

                <ng-template [container]="portalContainer" rdxDrawerPortal>
                    <div rdxDrawerBackdrop></div>
                    <div rdxDrawerViewport>
                        <div rdxDrawerPopup>Body</div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class LocalSwipeAreaHostComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxDrawerRoot, RdxDrawerPortal, RdxDrawerViewport, RdxDrawerVirtualKeyboardProvider, RdxDrawerPopup],
    template: `
        <div [(open)]="open" rdxDrawerRoot>
            <ng-template rdxDrawerPortal>
                <div data-testid="viewport" rdxDrawerViewport rdxDrawerVirtualKeyboardProvider>
                    <div rdxDrawerPopup>
                        <div data-testid="scroller" style="height: 240px; overflow-y: auto">
                            <input data-testid="field" />
                            <button data-testid="button">Button</button>
                        </div>

                        <div [(open)]="nested" rdxDrawerRoot>
                            <ng-template rdxDrawerPortal>
                                <div rdxDrawerPopup>Nested</div>
                            </ng-template>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
class VirtualKeyboardHostComponent {
    open = true;
    nested = false;
}

function popup(): HTMLElement | null {
    return document.body.querySelector('[rdxDrawerPopup]');
}

function pointer(type: string, props: { clientX?: number; clientY?: number }): MouseEvent {
    const event = new MouseEvent(type, { bubbles: true, button: 0, ...props });
    Object.defineProperty(event, 'isPrimary', { value: true });
    Object.defineProperty(event, 'pointerId', { value: 1 });
    return event;
}

function touch(type: string, target: EventTarget, props: { clientX: number; clientY: number }): TouchEvent {
    const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
    const touchLike = { clientX: props.clientX, clientY: props.clientY, target };

    Object.defineProperty(event, 'touches', {
        value: type === 'touchend' || type === 'touchcancel' ? [] : [touchLike]
    });
    Object.defineProperty(event, 'changedTouches', { value: [touchLike] });

    return event;
}

function mockRect(element: HTMLElement, rect: Partial<DOMRect>): void {
    element.getBoundingClientRect = () =>
        ({
            x: rect.left ?? 0,
            y: rect.top ?? 0,
            width: rect.width ?? 0,
            height: rect.height ?? 0,
            top: rect.top ?? 0,
            right: rect.right ?? rect.width ?? 0,
            bottom: rect.bottom ?? rect.height ?? 0,
            left: rect.left ?? 0,
            toJSON: () => ({})
        }) as DOMRect;
}

function setReadonlyNumber(element: HTMLElement, key: 'clientHeight' | 'scrollHeight', value: number): void {
    Object.defineProperty(element, key, { configurable: true, value });
}

async function nextAnimationFrame(): Promise<void> {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function installVisualViewportMock(initial: { height: number; offsetTop?: number; scale?: number }) {
    const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const viewport = {
        height: initial.height,
        width: window.innerWidth,
        offsetTop: initial.offsetTop ?? 0,
        offsetLeft: 0,
        pageTop: 0,
        pageLeft: 0,
        scale: initial.scale ?? 1,
        addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
            const typeListeners = listeners.get(type) ?? new Set<EventListenerOrEventListenerObject>();
            typeListeners.add(listener);
            listeners.set(type, typeListeners);
        },
        removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
            listeners.get(type)?.delete(listener);
        },
        dispatch: (type: string) => {
            for (const listener of listeners.get(type) ?? []) {
                if (typeof listener === 'function') {
                    listener(new Event(type));
                } else {
                    listener.handleEvent(new Event(type));
                }
            }
        }
    };

    Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: viewport
    });

    return {
        viewport,
        restore: () => {
            if (originalDescriptor) {
                Object.defineProperty(window, 'visualViewport', originalDescriptor);
            } else {
                delete (window as Partial<Window>).visualViewport;
            }
        }
    };
}

beforeAll(() => {
    class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
    }

    Object.defineProperty(window, 'ResizeObserver', {
        configurable: true,
        value: ResizeObserverMock
    });
    Object.defineProperty(globalThis, 'ResizeObserver', {
        configurable: true,
        value: ResizeObserverMock
    });
    Object.defineProperty(document, 'elementFromPoint', {
        configurable: true,
        value: () => null
    });
});

afterEach(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    vi.restoreAllMocks();
});

describe('Drawer', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let trigger: HTMLButtonElement;

    beforeEach(() => {
        document.body.style.overflow = '';
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxDrawerTrigger]');
    });

    afterEach(() => {
        fixture.destroy();
        document.body.style.overflow = '';
    });

    it('exports parts via drawerImports', () => {
        expect(drawerImports).toContain(RdxDrawerRoot);
        expect(drawerImports).toContain(RdxDrawerPopup);
        expect(drawerImports).toContain(RdxDrawerSwipeArea);
    });

    it('opens from the trigger as a modal dialog by default', () => {
        trigger.click();
        fixture.detectChanges();

        const drawer = popup()!;
        const title: HTMLElement = document.body.querySelector('[rdxDrawerTitle]')!;

        expect(fixture.componentInstance.open).toBe(true);
        expect(drawer.getAttribute('role')).toBe('dialog');
        expect(drawer.getAttribute('aria-modal')).toBe('true');
        expect(drawer.getAttribute('aria-labelledby')).toBe(title.id);
        expect(drawer.getAttribute('data-swipe-direction')).toBe('down');
    });

    it('reflects the swipeDirection on the popup', () => {
        fixture.componentInstance.swipeDirection = 'right';
        fixture.componentInstance.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(popup()!.getAttribute('data-swipe-direction')).toBe('right');
    });

    it('defaults the swipe area opening direction opposite to the dismiss direction', () => {
        fixture.componentInstance.swipeDirection = 'right';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const swipeArea: HTMLElement = fixture.nativeElement.querySelector('[rdxDrawerSwipeArea]');

        expect(swipeArea.getAttribute('data-swipe-direction')).toBe('left');
        expect(swipeArea.getAttribute('role')).toBe('presentation');
        expect(swipeArea.getAttribute('aria-hidden')).toBe('true');
    });

    it('stops the swipe area from intercepting pointer events while open', () => {
        fixture.componentInstance.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const swipeArea: HTMLElement = fixture.nativeElement.querySelector('[rdxDrawerSwipeArea]');

        expect(swipeArea.style.pointerEvents).toBe('none');
    });

    it('locks body scroll while open when modal', () => {
        trigger.click();
        fixture.detectChanges();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(true);

        (document.body.querySelector('[rdxDrawerClose]') as HTMLButtonElement).click();
        fixture.detectChanges();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
    });

    it('does not lock scroll and drops aria-modal when made non-modal', () => {
        fixture.componentInstance.modal = false;
        fixture.componentInstance.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
        expect(popup()!.getAttribute('aria-modal')).toBeNull();
    });

    it('closes on Escape', async () => {
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
        expect(fixture.componentInstance.changes.at(-1)).toBe('escape-key');
    });

    it('does not start a gesture for a tap (clicks inside the drawer keep working)', () => {
        fixture.componentInstance.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const drawer = popup()!;
        // Press and release without crossing the drag threshold: no gesture, no data-swiping.
        drawer.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
        expect(drawer.getAttribute('data-swiping')).toBeNull();

        window.dispatchEvent(pointer('pointerup', { clientX: 0, clientY: 1 }));
        fixture.detectChanges();

        expect(drawer.getAttribute('data-swiping')).toBeNull();
        expect(fixture.componentInstance.open).toBe(true);
    });

    it('dismisses on a swipe past the threshold and reports reason "swipe"', () => {
        fixture.componentInstance.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const drawer = popup()!;
        drawer.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
        // The gesture only begins once the pointer crosses the drag threshold.
        expect(drawer.getAttribute('data-swiping')).toBeNull();

        window.dispatchEvent(pointer('pointermove', { clientX: 0, clientY: 400 }));
        expect(drawer.getAttribute('data-swiping')).toBe('');

        window.dispatchEvent(pointer('pointerup', { clientX: 0, clientY: 400 }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
        expect(fixture.componentInstance.changes.at(-1)).toBe('swipe');
    });

    it('snaps back without closing when the swipe is cancelled mid-drag', () => {
        fixture.componentInstance.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const drawer = popup()!;
        drawer.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
        window.dispatchEvent(pointer('pointermove', { clientX: 0, clientY: 60 }));
        expect(drawer.getAttribute('data-swiping')).toBe('');

        window.dispatchEvent(pointer('pointercancel', { clientX: 0, clientY: 60 }));
        fixture.detectChanges();

        expect(drawer.getAttribute('data-swiping')).toBeNull();
        expect(fixture.componentInstance.open).toBe(true);
    });

    it('controls a drawer from a detached trigger handle', () => {
        const detachedFixture = TestBed.createComponent(DetachedHostComponent);
        detachedFixture.detectChanges();

        const detached: HTMLButtonElement = detachedFixture.nativeElement.querySelector('#detached');
        detached.click();
        detachedFixture.detectChanges();

        expect(detachedFixture.componentInstance.handle.isOpen()).toBe(true);
        expect(document.body.querySelector('[rdxDrawerPopup]')).not.toBeNull();
        detachedFixture.destroy();
    });

    it('has no accessibility violations when open', async () => {
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(await axe(popup()!)).toHaveNoViolations();
    });

    describe('snap points', () => {
        let snapFixture: ComponentFixture<SnapHostComponent>;

        beforeEach(() => {
            snapFixture = TestBed.createComponent(SnapHostComponent);
            snapFixture.detectChanges();
        });

        afterEach(() => snapFixture.destroy());

        it('opens at the first snap point by default', () => {
            snapFixture.componentInstance.open = true;
            snapFixture.changeDetectorRef.markForCheck();
            snapFixture.detectChanges();

            expect(snapFixture.componentInstance.snapPoint).toBe('160px');
        });

        it('opens at defaultSnapPoint when provided', () => {
            snapFixture.componentInstance.defaultSnapPoint = 0.5;
            snapFixture.componentInstance.open = true;
            snapFixture.changeDetectorRef.markForCheck();
            snapFixture.detectChanges();

            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);
        });

        it('keeps a controlled snap point across close (does not clobber the binding)', () => {
            snapFixture.componentInstance.snapPoint = 0.5;
            snapFixture.componentInstance.open = true;
            snapFixture.changeDetectorRef.markForCheck();
            snapFixture.detectChanges();
            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);

            snapFixture.componentInstance.open = false;
            snapFixture.changeDetectorRef.markForCheck();
            snapFixture.detectChanges();

            // The active snap point survives a close/reopen cycle instead of being reset to null.
            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);

            snapFixture.componentInstance.open = true;
            snapFixture.changeDetectorRef.markForCheck();
            snapFixture.detectChanges();
            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);
        });

        it('honors a controlled snap point without overriding it on open', () => {
            snapFixture.componentInstance.snapPoint = 0.5;
            snapFixture.componentInstance.open = true;
            snapFixture.changeDetectorRef.markForCheck();
            snapFixture.detectChanges();

            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);
        });
    });
});

describe('RdxDrawerProvider', () => {
    it('tracks open count, active state, and the frontmost drawer state', () => {
        const provider = new RdxDrawerProvider();
        const progressA = signal(0.25);
        const progressB = signal(0.5);

        expect(provider.active()).toBe(false);
        expect(provider.frontmostHeight()).toBe(0);
        expect(provider.swipeProgress()).toBe(0);

        const releaseA = provider.register({ id: 'a', height: signal(100), swipeProgress: progressA });
        const releaseB = provider.register({ id: 'b', height: signal(220), swipeProgress: progressB });

        expect(provider.count()).toBe(2);
        expect(provider.active()).toBe(true);
        expect(provider.frontmostHeight()).toBe(220);
        expect(provider.swipeProgress()).toBe(0.5);

        progressB.set(0.75);
        expect(provider.swipeProgress()).toBe(0.75);

        releaseB();
        expect(provider.frontmostHeight()).toBe(100);
        expect(provider.swipeProgress()).toBe(0.25);

        releaseA();
        expect(provider.active()).toBe(false);
    });
});

describe('Drawer nesting & provider', () => {
    let fixture: ComponentFixture<NestedHostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [NestedHostComponent] });
        fixture = TestBed.createComponent(NestedHostComponent);
        fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('marks the indented background active while a drawer is open', () => {
        const indent = fixture.nativeElement.querySelector('#indent') as HTMLElement;
        expect(indent.getAttribute('data-active')).toBeNull();

        fixture.componentInstance.outer = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(indent.getAttribute('data-active')).toBe('');
    });

    it('flags the parent popup when a nested drawer opens', () => {
        fixture.componentInstance.outer = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const outer = document.body.querySelector('[data-testid="outer"]') as HTMLElement;
        expect(outer.getAttribute('data-nested-drawer-open')).toBeNull();

        fixture.componentInstance.inner = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(outer.getAttribute('data-nested-drawer-open')).toBe('');
    });

    it('stacks three levels deep with each parent flagged', () => {
        fixture.componentInstance.outer = true;
        fixture.componentInstance.inner = true;
        fixture.componentInstance.deep = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        const outer = document.body.querySelector('[data-testid="outer"]') as HTMLElement;
        const inner = document.body.querySelector('[data-testid="inner"]') as HTMLElement;
        const deep = document.body.querySelector('[data-testid="deep"]') as HTMLElement;

        // All three popups are mounted simultaneously (stacked, not replaced).
        expect(outer).not.toBeNull();
        expect(inner).not.toBeNull();
        expect(deep).not.toBeNull();

        // Each parent reports an open nested drawer; the frontmost does not.
        expect(outer.getAttribute('data-nested-drawer-open')).toBe('');
        expect(inner.getAttribute('data-nested-drawer-open')).toBe('');
        expect(deep.getAttribute('data-nested-drawer-open')).toBeNull();
    });
});

describe('Drawer structural portal', () => {
    it('opens from a right-edge swipe area and portals into a local container', () => {
        const fixture = TestBed.createComponent(LocalSwipeAreaHostComponent);
        fixture.detectChanges();

        const container: HTMLElement = fixture.nativeElement.querySelector('[data-testid="portal-container"]');
        const swipeArea: HTMLElement = fixture.nativeElement.querySelector('[data-testid="swipe-area"]');

        swipeArea.dispatchEvent(pointer('pointerdown', { clientX: 100, clientY: 0 }));
        window.dispatchEvent(pointer('pointermove', { clientX: 60, clientY: 0 }));
        fixture.detectChanges();

        expect(container.querySelector('[rdxDrawerBackdrop]')).not.toBeNull();
        expect(container.querySelector('[rdxDrawerViewport]')).not.toBeNull();
        expect(container.querySelector('[rdxDrawerPopup]')).not.toBeNull();

        fixture.destroy();
    });

    it('throws in dev mode when rdxDrawerPortal is used as an attribute instead of structurally', () => {
        @Component({
            changeDetection: ChangeDetectionStrategy.Eager,
            imports: [RdxDrawerRoot, RdxDrawerTrigger, RdxDrawerPortal, RdxDrawerPortalMisuseGuard, RdxDrawerPopup],
            template: `
                <div rdxDrawerRoot>
                    <button rdxDrawerTrigger>Open</button>

                    <div rdxDrawerPortal>
                        <div rdxDrawerPopup>Oops</div>
                    </div>
                </div>
            `
        })
        class MisuseHostComponent {}

        expect(() => {
            const misuseFixture = TestBed.createComponent(MisuseHostComponent);
            misuseFixture.detectChanges();
        }).toThrow(/structural directive/);
    });
});

describe('Drawer virtual keyboard provider', () => {
    let fixture: ComponentFixture<VirtualKeyboardHostComponent>;
    let viewportMock: ReturnType<typeof installVisualViewportMock>;

    beforeEach(() => {
        viewportMock = installVisualViewportMock({ height: 500 });
        TestBed.configureTestingModule({ imports: [VirtualKeyboardHostComponent] });
        fixture = TestBed.createComponent(VirtualKeyboardHostComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        viewportMock.restore();
    });

    function viewport(): HTMLElement {
        return document.body.querySelector('[data-testid="viewport"]')!;
    }

    function scroller(): HTMLElement {
        return document.body.querySelector('[data-testid="scroller"]')!;
    }

    function field(): HTMLInputElement {
        return document.body.querySelector('[data-testid="field"]')!;
    }

    it('exports the virtual keyboard provider via drawerImports', () => {
        expect(drawerImports).toContain(RdxDrawerVirtualKeyboardProvider);
    });

    it('publishes keyboard inset and adds temporary scroll slack while a focused field overlaps it', async () => {
        const scrollElement = scroller();
        const input = field();

        setReadonlyNumber(scrollElement, 'clientHeight', 240);
        setReadonlyNumber(scrollElement, 'scrollHeight', 1000);
        mockRect(scrollElement, { top: 0, bottom: 600 });
        mockRect(input, { top: 520, bottom: 560 });
        scrollElement.scrollTo = ({ top }: ScrollToOptions) => {
            scrollElement.scrollTop = Number(top);
        };

        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        viewportMock.viewport.dispatch('resize');
        await nextAnimationFrame();

        expect(viewport().style.getPropertyValue('--drawer-keyboard-inset')).toBe('268px');
        expect(scrollElement.style.overflowAnchor).toBe('none');
        expect(scrollElement.style.paddingBottom).toBe('148px');
        expect(scrollElement.style.scrollPaddingBottom).toBe('16px');
        expect(scrollElement.scrollTop).toBeGreaterThan(0);

        input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        await nextAnimationFrame();

        expect(viewport().style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
        expect(scrollElement.style.overflowAnchor).toBe('');
        expect(scrollElement.style.paddingBottom).toBe('');
        expect(scrollElement.style.scrollPaddingBottom).toBe('');
    });

    it('uses synchronous tap-to-focus and redispatches click for keyboard inputs', () => {
        const input = field();
        const clicked = vi.fn();
        (document.activeElement as HTMLElement | null)?.blur();
        input.addEventListener('click', clicked);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(input);

        viewport().dispatchEvent(touch('touchstart', input, { clientX: 10, clientY: 20 }));
        const touchEnd = touch('touchend', input, { clientX: 10, clientY: 20 });
        const preventDefault = vi.spyOn(touchEnd, 'preventDefault');
        viewport().dispatchEvent(touchEnd);

        expect(document.activeElement).toBe(input);
        expect(preventDefault).toHaveBeenCalled();
        expect(clicked).toHaveBeenCalledTimes(1);
    });

    it('does not steal a tap that lands on another interactive element', () => {
        const input = field();
        const button: HTMLButtonElement = document.body.querySelector('[data-testid="button"]')!;
        const clicked = vi.fn();
        (document.activeElement as HTMLElement | null)?.blur();
        button.addEventListener('click', clicked);
        vi.spyOn(document, 'elementFromPoint').mockReturnValue(button);

        viewport().dispatchEvent(touch('touchstart', input, { clientX: 10, clientY: 20 }));
        const touchEnd = touch('touchend', input, { clientX: 10, clientY: 20 });
        const preventDefault = vi.spyOn(touchEnd, 'preventDefault');
        viewport().dispatchEvent(touchEnd);

        expect(preventDefault).not.toHaveBeenCalled();
        expect(document.activeElement).not.toBe(input);
        expect(clicked).not.toHaveBeenCalled();
    });

    it('suspends keyboard alignment while a nested drawer is open', async () => {
        const input = field();
        fixture.componentInstance.nested = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        viewportMock.viewport.dispatch('resize');
        await nextAnimationFrame();

        expect(viewport().style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
    });
});
