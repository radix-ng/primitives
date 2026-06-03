import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import {
    createRdxPreviewCardHandle,
    RdxPreviewCardArrow,
    RdxPreviewCardOpenChange,
    RdxPreviewCardPopup,
    RdxPreviewCardPortal,
    RdxPreviewCardPortalPresence,
    RdxPreviewCardPositioner,
    RdxPreviewCardRoot,
    RdxPreviewCardTrigger,
    RdxPreviewCardViewport
} from '@radix-ng/primitives/preview-card';
import { vi } from 'vitest';

@Component({
    imports: [
        RdxPreviewCardArrow,
        RdxPreviewCardPopup,
        RdxPreviewCardPortal,
        RdxPreviewCardPortalPresence,
        RdxPreviewCardPositioner,
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger
    ],
    template: `
        <ng-container #root="rdxPreviewCardRoot" [(open)]="open" rdxPreviewCardRoot>
            <a href="#" rdxPreviewCardTrigger>Typography</a>

            <ng-template rdxPreviewCardPortalPresence>
                <div data-test-preview-card-portal rdxPreviewCardPortal>
                    <div rdxPreviewCardPositioner>
                        <div rdxPreviewCardPopup>
                            <span rdxPreviewCardArrow></span>
                            Typography preview
                        </div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
class TestHostComponent {
    open = false;
}

@Component({
    imports: [
        RdxPreviewCardPopup,
        RdxPreviewCardPortal,
        RdxPreviewCardPortalPresence,
        RdxPreviewCardPositioner,
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger
    ],
    template: `
        <ng-container
            #root="rdxPreviewCardRoot"
            [defaultOpen]="true"
            defaultTriggerId="default-trigger"
            rdxPreviewCardRoot
        >
            <a id="default-trigger" href="#" rdxPreviewCardTrigger>Default</a>

            <ng-template rdxPreviewCardPortalPresence>
                <div rdxPreviewCardPortal>
                    <div rdxPreviewCardPositioner>
                        <div rdxPreviewCardPopup>Preview</div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
class DefaultOpenHostComponent {
    @ViewChild(RdxPreviewCardRoot)
    root!: RdxPreviewCardRoot;
}

@Component({
    imports: [RdxPreviewCardPopup, RdxPreviewCardPositioner, RdxPreviewCardRoot, RdxPreviewCardTrigger],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <a id="one" href="#" payload="one" rdxPreviewCardTrigger>One</a>
            <a id="two" href="#" payload="two" rdxPreviewCardTrigger>Two</a>

            @if (root.open()) {
                <div rdxPreviewCardPositioner>
                    <div rdxPreviewCardPopup>{{ root.payload() }}</div>
                </div>
            }
        </ng-container>
    `
})
class MultipleTriggersHostComponent {
    @ViewChild(RdxPreviewCardRoot)
    root!: RdxPreviewCardRoot;
}

@Component({
    imports: [RdxPreviewCardPopup, RdxPreviewCardPositioner, RdxPreviewCardRoot, RdxPreviewCardTrigger],
    template: `
        <a id="detached-one" [handle]="handle" href="#" payload="one" rdxPreviewCardTrigger>One</a>
        <a id="detached-two" [handle]="handle" href="#" payload="two" rdxPreviewCardTrigger>Two</a>

        <ng-container #root="rdxPreviewCardRoot" [handle]="handle" rdxPreviewCardRoot>
            @if (root.open()) {
                <div rdxPreviewCardPositioner>
                    <div rdxPreviewCardPopup>{{ root.payload() }}</div>
                </div>
            }
        </ng-container>
    `
})
class DetachedTriggersHostComponent {
    @ViewChild(RdxPreviewCardRoot)
    root!: RdxPreviewCardRoot;

    readonly handle = createRdxPreviewCardHandle();
}

@Component({
    imports: [
        RdxPreviewCardPopup,
        RdxPreviewCardPortal,
        RdxPreviewCardPortalPresence,
        RdxPreviewCardPositioner,
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger
    ],
    template: `
        <ng-container #root="rdxPreviewCardRoot" (onOpenChangeComplete)="complete.push($event)" rdxPreviewCardRoot>
            <a [delay]="0" href="#" rdxPreviewCardTrigger>Open</a>

            <ng-template rdxPreviewCardPortalPresence>
                <div rdxPreviewCardPortal>
                    <div rdxPreviewCardPositioner>
                        <div rdxPreviewCardPopup>Preview</div>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
class LifecycleHostComponent {
    readonly complete: boolean[] = [];
}

@Component({
    imports: [
        RdxPreviewCardPopup,
        RdxPreviewCardPositioner,
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger,
        RdxPreviewCardViewport
    ],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <a id="viewport-one" href="#" payload="one" rdxPreviewCardTrigger>One</a>
            <a id="viewport-two" href="#" payload="two" rdxPreviewCardTrigger>Two</a>

            @if (root.open()) {
                <div rdxPreviewCardPositioner>
                    <div rdxPreviewCardPopup>
                        <div rdxPreviewCardViewport>
                            <div style="transition-duration: 1s">{{ root.payload() }}</div>
                        </div>
                    </div>
                </div>
            }
        </ng-container>
    `
})
class ViewportHostComponent {}

@Component({
    imports: [
        RdxPreviewCardArrow,
        RdxPreviewCardPopup,
        RdxPreviewCardPositioner,
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger
    ],
    template: `
        <ng-container #root="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <a href="#" rdxPreviewCardTrigger>Open</a>

            @if (root.open()) {
                <div rdxPreviewCardPositioner>
                    <div rdxPreviewCardPopup>
                        Preview
                        <span rdxPreviewCardArrow></span>
                    </div>
                </div>
            }
        </ng-container>
    `
})
class PositionerDefaultsHostComponent {}

@Component({
    imports: [
        RdxPreviewCardPopup,
        RdxPreviewCardPortal,
        RdxPreviewCardPortalPresence,
        RdxPreviewCardPositioner,
        RdxPreviewCardRoot,
        RdxPreviewCardTrigger
    ],
    template: `
        <ng-container #parent="rdxPreviewCardRoot" rdxPreviewCardRoot>
            <a [delay]="0" href="#" rdxPreviewCardTrigger>Parent</a>

            @if (parent.open()) {
                <div rdxPreviewCardPositioner>
                    <div rdxPreviewCardPopup>
                        <ng-container #child="rdxPreviewCardRoot" rdxPreviewCardRoot>
                            <a [delay]="0" href="#" rdxPreviewCardTrigger>Child</a>

                            <ng-template rdxPreviewCardPortalPresence>
                                <div data-test-child-portal rdxPreviewCardPortal>
                                    <div rdxPreviewCardPositioner>
                                        <div rdxPreviewCardPopup>Child popup</div>
                                    </div>
                                </div>
                            </ng-template>
                        </ng-container>
                    </div>
                </div>
            }
        </ng-container>
    `
})
class NestedPreviewCardHostComponent {
    @ViewChildren(RdxPreviewCardRoot)
    roots!: QueryList<RdxPreviewCardRoot>;
}

function pointerEvent(type: string, pointerType = 'mouse', clientX = 0, clientY = 0) {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    Object.defineProperty(event, 'clientX', { value: clientX });
    Object.defineProperty(event, 'clientY', { value: clientY });
    return event;
}

describe('PreviewCard', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let trigger: HTMLAnchorElement;
    let originalResizeObserver: typeof globalThis.ResizeObserver;

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
        Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: originalResizeObserver });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxPreviewCardTrigger]');
    });

    it('opens on hover after the configured delay and closes on click', () => {
        vi.useFakeTimers();

        trigger.dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(599);
        expect(fixture.componentInstance.open).toBe(false);

        vi.advanceTimersByTime(1);
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(true);
        expect(trigger.hasAttribute('data-popup-open')).toBe(true);

        trigger.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
        vi.useRealTimers();
    });

    it('opens on focus and closes on blur', () => {
        vi.useFakeTimers();

        trigger.dispatchEvent(new FocusEvent('focus'));
        vi.advanceTimersByTime(600);
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(true);

        trigger.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
        vi.useRealTimers();
    });

    it('uses defaultOpen with defaultTriggerId', () => {
        const defaultFixture = TestBed.createComponent(DefaultOpenHostComponent);
        defaultFixture.detectChanges();

        const root = defaultFixture.componentInstance.root;
        const defaultTrigger: HTMLAnchorElement = defaultFixture.nativeElement.querySelector('[rdxPreviewCardTrigger]');

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(defaultTrigger);
        expect(defaultTrigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('switches active anchors between triggers inside one root', () => {
        vi.useFakeTimers();
        const multipleFixture = TestBed.createComponent(MultipleTriggersHostComponent);
        multipleFixture.detectChanges();

        const root = multipleFixture.componentInstance.root;
        const triggers: HTMLAnchorElement[] = multipleFixture.nativeElement.querySelectorAll('[rdxPreviewCardTrigger]');

        triggers[0].dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(600);
        multipleFixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(triggers[0]);
        expect(root.payload()).toBe('one');

        triggers[1].dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(600);
        multipleFixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(triggers[1]);
        expect(root.payload()).toBe('two');
    });

    it('connects detached triggers to a root through a handle', () => {
        const detachedFixture = TestBed.createComponent(DetachedTriggersHostComponent);
        detachedFixture.detectChanges();

        const root = detachedFixture.componentInstance.root;
        const triggers: HTMLAnchorElement[] = detachedFixture.nativeElement.querySelectorAll('[rdxPreviewCardTrigger]');

        detachedFixture.componentInstance.handle.open('detached-two');
        detachedFixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(triggers[1]);
        expect(root.payload()).toBe('two');
    });

    it('emits open completion and exposes transition lifecycle attributes', async () => {
        const lifecycleFixture = TestBed.createComponent(LifecycleHostComponent);
        lifecycleFixture.detectChanges();

        const lifecycleTrigger: HTMLAnchorElement =
            lifecycleFixture.nativeElement.querySelector('[rdxPreviewCardTrigger]');
        lifecycleTrigger.dispatchEvent(pointerEvent('pointerenter'));
        await new Promise((resolve) => setTimeout(resolve));
        lifecycleFixture.detectChanges();

        const popup: HTMLElement = document.body.querySelector('[rdxPreviewCardPopup]')!;
        expect(popup.hasAttribute('data-starting-style')).toBe(true);

        await new Promise((resolve) => setTimeout(resolve, 30));
        lifecycleFixture.detectChanges();

        expect(lifecycleFixture.componentInstance.complete).toEqual([true]);

        lifecycleTrigger.click();
        lifecycleFixture.detectChanges();

        expect(popup.hasAttribute('data-ending-style')).toBe(true);

        await new Promise((resolve) => setTimeout(resolve));
        lifecycleFixture.detectChanges();

        expect(lifecycleFixture.componentInstance.complete).toEqual([true, false]);
    });

    it('uses Base UI-aligned positioner defaults and state attributes', () => {
        vi.useFakeTimers();
        const defaultsFixture = TestBed.createComponent(PositionerDefaultsHostComponent);
        defaultsFixture.detectChanges();

        const defaultsTrigger: HTMLAnchorElement =
            defaultsFixture.nativeElement.querySelector('[rdxPreviewCardTrigger]');
        defaultsTrigger.dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(600);
        defaultsFixture.detectChanges();
        vi.useRealTimers();

        const positionerDebug = defaultsFixture.debugElement.query(By.directive(RdxPreviewCardPositioner));
        const positioner = positionerDebug.injector.get(RdxPreviewCardPositioner);
        const wrapper = positionerDebug.injector.get(RdxPopperContentWrapper);
        const positionerElement: HTMLElement = positionerDebug.nativeElement;
        const arrow: HTMLElement = defaultsFixture.nativeElement.querySelector('[rdxPreviewCardArrow]');

        expect(positioner.arrowPadding()).toBe(5);
        expect(positioner.collisionPadding()).toBe(5);
        expect(positioner.updatePositionStrategy()).toBe('always');
        expect(wrapper.arrowPadding()).toBe(5);
        expect(wrapper.collisionPadding()).toBe(5);
        expect(wrapper.updatePositionStrategy()).toBe('always');
        expect(positionerElement.hasAttribute('data-open')).toBe(true);
        expect(positionerElement.style.getPropertyValue('--anchor-width')).toBe('var(--radix-popper-anchor-width)');
        expect(arrow.hasAttribute('data-open')).toBe(true);

        defaultsFixture.destroy();
    });

    it('keeps a parent open while moving into a nested portaled preview card', () => {
        vi.useFakeTimers();
        const nestedFixture = TestBed.createComponent(NestedPreviewCardHostComponent);
        nestedFixture.detectChanges();

        const parentTrigger: HTMLAnchorElement = nestedFixture.nativeElement.querySelector('[rdxPreviewCardTrigger]');
        parentTrigger.dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(0);
        nestedFixture.detectChanges();

        const childTrigger: HTMLAnchorElement =
            nestedFixture.nativeElement.querySelectorAll('[rdxPreviewCardTrigger]')[1];
        childTrigger.dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(0);
        nestedFixture.detectChanges();

        const roots = nestedFixture.componentInstance.roots.toArray();
        const parentPositioner: HTMLElement = nestedFixture.nativeElement.querySelector('[rdxPreviewCardPositioner]');
        const childPopup: HTMLElement | null = document.body.querySelector(
            '[data-test-child-portal] [rdxPreviewCardPopup]'
        );

        expect(childPopup).not.toBeNull();

        parentPositioner.dispatchEvent(pointerEvent('pointerleave', 'mouse', 10, 10));
        childPopup?.dispatchEvent(pointerEvent('pointermove', 'mouse', 1000, 1000));
        vi.advanceTimersByTime(0);

        expect(roots[0].open()).toBe(true);
        nestedFixture.destroy();
    });

    it('retains previous viewport content while switching triggers', () => {
        vi.useFakeTimers();
        const viewportFixture = TestBed.createComponent(ViewportHostComponent);
        viewportFixture.detectChanges();

        const triggers: HTMLAnchorElement[] = viewportFixture.nativeElement.querySelectorAll('[rdxPreviewCardTrigger]');
        triggers[0].getBoundingClientRect = () => new DOMRect(0, 0, 40, 20);
        triggers[1].getBoundingClientRect = () => new DOMRect(100, 50, 40, 20);

        triggers[0].dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(600);
        viewportFixture.detectChanges();

        const popup: HTMLElement = viewportFixture.nativeElement.querySelector('[rdxPreviewCardPopup]');
        popup.getBoundingClientRect = () => new DOMRect(0, 0, 240, 120);

        triggers[1].dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(600);
        viewportFixture.detectChanges();

        const viewport: HTMLElement = viewportFixture.nativeElement.querySelector('[rdxPreviewCardViewport]');
        const previous: HTMLElement = viewport.querySelector('[data-previous]')!;
        const current: HTMLElement = viewport.querySelector('[data-current]')!;

        expect(viewport.getAttribute('data-activation-direction')).toBe('right down');
        expect(previous.textContent).toContain('one');
        expect(previous.getAttribute('aria-hidden')).toBe('true');
        expect(previous.hasAttribute('inert')).toBe(true);
        expect(previous.style.getPropertyValue('--popup-width')).toBe('240px');
        expect(previous.style.getPropertyValue('--popup-height')).toBe('120px');
        expect(current.textContent).toContain('two');

        previous.dispatchEvent(new Event('transitionend'));
        viewportFixture.detectChanges();

        expect(viewport.querySelector('[data-previous]')).toBeNull();
        expect(viewport.hasAttribute('data-transitioning')).toBe(false);
    });

    it('emits controlled open change details', () => {
        @Component({
            imports: [RdxPreviewCardPopup, RdxPreviewCardPositioner, RdxPreviewCardRoot, RdxPreviewCardTrigger],
            template: `
                <ng-container
                    [(open)]="open"
                    [(triggerId)]="triggerId"
                    (onOpenChange)="changes.push($event)"
                    rdxPreviewCardRoot
                >
                    <a id="controlled-one" href="#" payload="one" rdxPreviewCardTrigger>One</a>
                    <a id="controlled-two" href="#" payload="two" rdxPreviewCardTrigger>Two</a>

                    @if (open) {
                        <div rdxPreviewCardPositioner>
                            <div rdxPreviewCardPopup>Preview</div>
                        </div>
                    }
                </ng-container>
            `
        })
        class ControlledHostComponent {
            open = false;
            triggerId: string | null = null;
            readonly changes: RdxPreviewCardOpenChange[] = [];
        }

        vi.useFakeTimers();
        const controlledFixture = TestBed.createComponent(ControlledHostComponent);
        controlledFixture.detectChanges();

        const triggers: HTMLAnchorElement[] =
            controlledFixture.nativeElement.querySelectorAll('[rdxPreviewCardTrigger]');
        triggers[1].dispatchEvent(pointerEvent('pointerenter'));
        vi.advanceTimersByTime(600);
        controlledFixture.detectChanges();

        expect(controlledFixture.componentInstance.open).toBe(true);
        expect(controlledFixture.componentInstance.triggerId).toBe('controlled-two');
        expect(controlledFixture.componentInstance.changes[0].reason).toBe('trigger-hover');
        expect(controlledFixture.componentInstance.changes[0].trigger).toBe(triggers[1]);
    });
});
