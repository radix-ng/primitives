import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import {
    createRdxPopoverHandle,
    RdxPopoverArrow,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverOpenChange,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPortalMisuseGuard,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger,
    RdxPopoverViewport
} from '@radix-ng/primitives/popover';
import { RdxPopper, RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import { vi } from 'vitest';

@Component({
    imports: [
        RdxPopoverClose,
        RdxPopoverDescription,
        RdxPopoverPopup,
        RdxPopoverPositioner,
        RdxPopoverRoot,
        RdxPopoverTitle,
        RdxPopoverTrigger
    ],
    template: `
        <div #root="rdxPopoverRoot" [(open)]="open" [defaultOpen]="defaultOpen" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>

            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        <h2 rdxPopoverTitle>Title</h2>
                        <p rdxPopoverDescription>Description</p>
                        <button rdxPopoverClose>Close</button>
                    </div>
                </div>
            }
        </div>
    `
})
class TestHostComponent {
    open = false;
    defaultOpen = false;
}

@Component({
    imports: [RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div [defaultOpen]="true" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>
        </div>
    `
})
class DefaultOpenHostComponent {}

@Component({
    imports: [RdxPopoverPortal, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>

            <div *rdxPopoverPortal data-test-popover-portal>Portal</div>
        </div>
    `
})
class PortalHostComponent {}

@Component({
    imports: [RdxPopoverPopup, RdxPopoverPortal, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" (onOpenChangeComplete)="complete.push($event)" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>

            <div *rdxPopoverPortal data-test-lifecycle-portal rdxPopoverPositioner>
                <div rdxPopoverPopup>Popup</div>
            </div>
        </div>
    `
})
class LifecycleHostComponent {
    readonly complete: boolean[] = [];
}

@Component({
    imports: [RdxPopoverPopup, RdxPopoverPortal, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #parent="rdxPopoverRoot" rdxPopoverRoot>
            <button [delay]="0" openOnHover rdxPopoverTrigger>Parent trigger</button>

            @if (parent.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        <div #child="rdxPopoverRoot" rdxPopoverRoot>
                            <button [delay]="0" openOnHover rdxPopoverTrigger>Child trigger</button>

                            <div *rdxPopoverPortal data-test-child-portal rdxPopoverPositioner>
                                <div rdxPopoverPopup>Child popup</div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
class NestedHoverPopupHostComponent {}

@Component({
    imports: [RdxPopoverArrow, RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>

            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        Popup
                        <span rdxPopoverArrow></span>
                    </div>
                </div>
            }
        </div>
    `
})
class PositionerDefaultsHostComponent {}

@Component({
    imports: [RdxPopoverClose, RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" [modal]="modal" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>

            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        @if (withClose) {
                            <button rdxPopoverClose>Close</button>
                        }
                    </div>
                </div>
            }
        </div>
    `
})
class ModalHostComponent {
    modal: boolean | 'trap-focus' = false;
    withClose = true;
}

@Component({
    imports: [RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" rdxPopoverRoot>
            <button id="internal-one" payload="one" rdxPopoverTrigger>One</button>
            <button id="internal-two" payload="two" rdxPopoverTrigger>Two</button>

            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>Popup</div>
                </div>
            }
        </div>
    `
})
class MultipleTriggersHostComponent {}

@Component({
    imports: [RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <button id="detached-one" [handle]="handle" payload="one" rdxPopoverTrigger>One</button>
        <button id="detached-two" [handle]="handle" payload="two" rdxPopoverTrigger>Two</button>

        <div #root="rdxPopoverRoot" [handle]="handle" rdxPopoverRoot>
            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>Popup</div>
                </div>
            }
        </div>
    `
})
class DetachedTriggersHostComponent {
    readonly handle = createRdxPopoverHandle();
}

@Component({
    imports: [RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" rdxPopoverRoot>
            @if (showTrigger()) {
                <button rdxPopoverTrigger>Open</button>
            }
        </div>
    `
})
class RemovableTriggerHostComponent {
    readonly showTrigger = signal(true);
}

@Component({
    imports: [RdxPopoverClose, RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" rdxPopoverRoot>
            <button [closeDelay]="closeDelay" [delay]="delay" openOnHover rdxPopoverTrigger>Open</button>

            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        Popup
                        <button rdxPopoverClose>Close</button>
                    </div>
                </div>
            }
        </div>
    `
})
class HoverHostComponent {
    delay = 300;
    closeDelay = 0;
}

@Component({
    imports: [RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger, RdxPopoverViewport],
    template: `
        <div #root="rdxPopoverRoot" rdxPopoverRoot>
            <button id="viewport-one" payload="one" rdxPopoverTrigger>One</button>
            <button id="viewport-two" payload="two" rdxPopoverTrigger>Two</button>

            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        <div rdxPopoverViewport>
                            <div>{{ root.payload() }}</div>
                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
class ViewportHostComponent {}

@Component({
    imports: [RdxPopoverClose, RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div
            #root="rdxPopoverRoot"
            [(open)]="open"
            [(triggerId)]="triggerId"
            [defaultOpen]="defaultOpen"
            [defaultTriggerId]="defaultTriggerId"
            (onOpenChange)="changes.push($event)"
            rdxPopoverRoot
        >
            <button id="controlled-one" payload="one" rdxPopoverTrigger>One</button>
            <button id="controlled-two" payload="two" rdxPopoverTrigger>Two</button>

            @if (root.open()) {
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        Popup
                        <button rdxPopoverClose>Close</button>
                    </div>
                </div>
            }
        </div>
    `
})
class ControlledMultipleTriggersHostComponent {
    open = false;
    triggerId: string | null = null;
    defaultOpen = false;
    defaultTriggerId: string | null = null;
    readonly changes: RdxPopoverOpenChange[] = [];
}

@Component({
    imports: [
        RdxPopoverClose,
        RdxPopoverPopup,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverRoot,
        RdxPopoverTrigger
    ],
    template: `
        <div [(open)]="open" (onOpenChange)="handleOpenChange($event)" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>

            <div *rdxPopoverPortal rdxPopoverPositioner>
                <div rdxPopoverPopup>
                    Popup
                    <button rdxPopoverClose>Close</button>
                </div>
            </div>
        </div>
    `
})
class PopoverCancelableHostComponent {
    open = false;
    cancelNextOpen = false;
    cancelNextClose = false;
    preventUnmountOnNextClose = false;
    readonly changes: RdxPopoverOpenChange[] = [];

    handleOpenChange(change: RdxPopoverOpenChange) {
        if (change.open && this.cancelNextOpen) {
            change.eventDetails.cancel();
            this.cancelNextOpen = false;
        }

        if (!change.open && this.cancelNextClose) {
            change.eventDetails.cancel();
            this.cancelNextClose = false;
        }

        if (!change.open && this.preventUnmountOnNextClose) {
            change.eventDetails.preventUnmountOnClose();
            this.preventUnmountOnNextClose = false;
        }

        this.changes.push(change);
    }
}

function pointerEvent(type: string, pointerType = 'mouse', clientX = 0, clientY = 0) {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    Object.defineProperty(event, 'clientX', { value: clientX });
    Object.defineProperty(event, 'clientY', { value: clientY });
    return event;
}

describe('Popover', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let trigger: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxPopoverTrigger]');
    });

    it('opens and closes from the trigger', () => {
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(trigger.getAttribute('data-state')).toBe('closed');

        trigger.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(true);
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(trigger.getAttribute('data-state')).toBe('open');

        trigger.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('exposes pressed state while the trigger press keeps the popover open', () => {
        trigger.click();
        fixture.detectChanges();

        expect(trigger.hasAttribute('data-pressed')).toBe(true);

        trigger.click();
        fixture.detectChanges();

        expect(trigger.hasAttribute('data-pressed')).toBe(false);
    });

    it('links the trigger and popup with accessible ids', () => {
        trigger.click();
        fixture.detectChanges();

        const popup: HTMLElement = fixture.nativeElement.querySelector('[rdxPopoverPopup]');
        const title: HTMLElement = fixture.nativeElement.querySelector('[rdxPopoverTitle]');
        const description: HTMLElement = fixture.nativeElement.querySelector('[rdxPopoverDescription]');

        expect(trigger.getAttribute('aria-controls')).toBe(popup.id);
        expect(popup.getAttribute('role')).toBe('dialog');
        expect(popup.getAttribute('aria-labelledby')).toBe(title.id);
        expect(popup.getAttribute('aria-describedby')).toBe(description.id);
        expect(popup.hasAttribute('data-open')).toBe(true);
    });

    it('closes from the close button', () => {
        trigger.click();
        fixture.detectChanges();

        const close: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxPopoverClose]');
        close.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('closes when Escape is pressed', async () => {
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('lets onOpenChange cancel an opening request', () => {
        const cancelFixture = TestBed.createComponent(PopoverCancelableHostComponent);
        cancelFixture.detectChanges();

        const cancelTrigger: HTMLButtonElement = cancelFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        cancelFixture.componentInstance.cancelNextOpen = true;
        cancelTrigger.click();
        cancelFixture.detectChanges();

        expect(cancelFixture.componentInstance.open).toBe(false);
        expect(document.body.querySelector('[rdxPopoverPopup]')).toBeNull();
        expect(cancelFixture.componentInstance.changes[0].eventDetails.isCanceled()).toBe(true);

        cancelFixture.destroy();
    });

    it('lets onOpenChange cancel a close request', () => {
        const cancelFixture = TestBed.createComponent(PopoverCancelableHostComponent);
        cancelFixture.detectChanges();

        const cancelTrigger: HTMLButtonElement = cancelFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        cancelTrigger.click();
        cancelFixture.detectChanges();

        const close: HTMLButtonElement = document.body.querySelector('[rdxPopoverClose]')!;
        cancelFixture.componentInstance.cancelNextClose = true;
        close.click();
        cancelFixture.detectChanges();

        expect(cancelFixture.componentInstance.open).toBe(true);
        expect(document.body.querySelector('[rdxPopoverPopup]')).not.toBeNull();
        expect(cancelFixture.componentInstance.changes.at(-1)?.eventDetails.isCanceled()).toBe(true);

        cancelFixture.destroy();
    });

    it('keeps the portal mounted after close when preventUnmountOnClose is requested', () => {
        const preventFixture = TestBed.createComponent(PopoverCancelableHostComponent);
        preventFixture.detectChanges();

        const preventTrigger: HTMLButtonElement = preventFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        preventTrigger.click();
        preventFixture.detectChanges();

        preventFixture.componentInstance.preventUnmountOnNextClose = true;
        const close: HTMLButtonElement = document.body.querySelector('[rdxPopoverClose]')!;
        close.click();
        preventFixture.detectChanges();

        expect(preventFixture.componentInstance.open).toBe(false);
        expect(document.body.querySelector('[rdxPopoverPopup]')).not.toBeNull();

        preventTrigger.click();
        preventFixture.detectChanges();
        expect(preventFixture.componentInstance.open).toBe(true);

        const closeAgain: HTMLButtonElement = document.body.querySelector('[rdxPopoverClose]')!;
        closeAgain.click();
        preventFixture.detectChanges();

        expect(preventFixture.componentInstance.open).toBe(false);
        expect(document.body.querySelector('[rdxPopoverPopup]')).toBeNull();

        preventFixture.destroy();
    });

    it('uses defaultOpen for uncontrolled state', () => {
        const defaultOpenFixture = TestBed.createComponent(DefaultOpenHostComponent);
        defaultOpenFixture.detectChanges();

        const defaultOpenTrigger: HTMLButtonElement =
            defaultOpenFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

        expect(defaultOpenTrigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('closes when a pointerdown event happens outside', async () => {
        trigger.click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));

        document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('closes rather than reopens when the open trigger is pressed', async () => {
        trigger.click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));

        trigger.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
        trigger.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        trigger.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('mounts the portal in the document body while open', () => {
        const portalFixture = TestBed.createComponent(PortalHostComponent);
        portalFixture.detectChanges();

        const portalTrigger: HTMLButtonElement = portalFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        expect(document.body.querySelector('[data-test-popover-portal]')).toBeNull();

        portalTrigger.click();
        portalFixture.detectChanges();

        expect(document.body.querySelector('[data-test-popover-portal]')).not.toBeNull();
    });

    it('throws in dev mode when rdxPopoverPortal is used as an attribute instead of structurally', () => {
        @Component({
            imports: [RdxPopoverPortal, RdxPopoverPortalMisuseGuard, RdxPopoverRoot, RdxPopoverTrigger],
            template: `
                <div rdxPopoverRoot>
                    <button rdxPopoverTrigger>Open</button>

                    <div rdxPopoverPortal>Oops</div>
                </div>
            `
        })
        class MisuseHostComponent {}

        expect(() => {
            const misuseFixture = TestBed.createComponent(MisuseHostComponent);
            misuseFixture.detectChanges();
        }).toThrow(/structural directive/);
    });

    it('emits open completion and exposes transition lifecycle attributes', async () => {
        const lifecycleFixture = TestBed.createComponent(LifecycleHostComponent);
        lifecycleFixture.detectChanges();

        const lifecycleTrigger: HTMLButtonElement = lifecycleFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        lifecycleTrigger.click();
        lifecycleFixture.detectChanges();

        const popup: HTMLElement = document.body.querySelector('[data-test-lifecycle-portal] [rdxPopoverPopup]')!;
        expect(popup.hasAttribute('data-starting-style')).toBe(true);

        await new Promise((resolve) => setTimeout(resolve, 30));
        lifecycleFixture.detectChanges();

        expect(popup.hasAttribute('data-starting-style')).toBe(false);
        expect(lifecycleFixture.componentInstance.complete).toEqual([true]);

        lifecycleTrigger.click();
        lifecycleFixture.detectChanges();

        expect(popup.hasAttribute('data-ending-style')).toBe(true);

        await new Promise((resolve) => setTimeout(resolve));
        lifecycleFixture.detectChanges();

        expect(lifecycleFixture.componentInstance.complete).toEqual([true, false]);
        lifecycleFixture.destroy();
    });

    it('uses Base UI-aligned positioner defaults and state attributes', () => {
        const originalResizeObserver = globalThis.ResizeObserver;
        Object.defineProperty(globalThis, 'ResizeObserver', {
            configurable: true,
            value: class {
                observe() {}
                disconnect() {}
            }
        });

        const defaultsFixture = TestBed.createComponent(PositionerDefaultsHostComponent);
        defaultsFixture.detectChanges();

        const defaultsTrigger: HTMLButtonElement = defaultsFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        defaultsTrigger.click();
        defaultsFixture.detectChanges();

        const positionerDebug = defaultsFixture.debugElement.query(By.directive(RdxPopoverPositioner));
        const positioner = positionerDebug.injector.get(RdxPopoverPositioner);
        const wrapper = positionerDebug.injector.get(RdxPopperContentWrapper);
        const positionerElement: HTMLElement = positionerDebug.nativeElement;
        const arrow: HTMLElement = defaultsFixture.nativeElement.querySelector('[rdxPopoverArrow]');

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
        Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: originalResizeObserver });
    });

    it('positions against a custom anchor', () => {
        @Component({
            imports: [RdxPopoverPopup, RdxPopoverPositioner, RdxPopoverRoot, RdxPopoverTrigger],
            template: `
                <div #root="rdxPopoverRoot" rdxPopoverRoot>
                    <button rdxPopoverTrigger>Open</button>
                    <button #customAnchor>Custom anchor</button>

                    @if (root.open()) {
                        <div [anchor]="customAnchor" rdxPopoverPositioner>
                            <div rdxPopoverPopup>Popup</div>
                        </div>
                    }
                </div>
            `
        })
        class CustomAnchorHostComponent {}

        const customAnchorFixture = TestBed.createComponent(CustomAnchorHostComponent);
        customAnchorFixture.detectChanges();

        const customAnchorTrigger: HTMLButtonElement =
            customAnchorFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        customAnchorTrigger.click();
        customAnchorFixture.detectChanges();

        const positioner = customAnchorFixture.debugElement
            .query(By.directive(RdxPopoverPositioner))
            .injector.get(RdxPopoverPositioner);
        const buttons: HTMLButtonElement[] = customAnchorFixture.nativeElement.querySelectorAll('button');

        expect(positioner.anchor()).toBe(buttons[1]);
    });

    it('locks scrolling and traps focus for a modal popover with a close button', () => {
        const modalFixture = TestBed.createComponent(ModalHostComponent);
        modalFixture.componentInstance.modal = true;
        modalFixture.detectChanges();

        const modalTrigger: HTMLButtonElement = modalFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        modalTrigger.click();
        modalFixture.detectChanges();

        const focusScope = modalFixture.debugElement.query(By.directive(RdxFocusScope)).injector.get(RdxFocusScope);

        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(true);
        expect(focusScope.isTrapped()).toBe(true);

        modalFixture.destroy();
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
    });

    it('does not trap focus for modal=true without a close button', () => {
        const modalFixture = TestBed.createComponent(ModalHostComponent);
        modalFixture.componentInstance.modal = true;
        modalFixture.componentInstance.withClose = false;
        modalFixture.detectChanges();

        const modalTrigger: HTMLButtonElement = modalFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        modalTrigger.click();
        modalFixture.detectChanges();

        const focusScope = modalFixture.debugElement.query(By.directive(RdxFocusScope)).injector.get(RdxFocusScope);

        expect(focusScope.isTrapped()).toBe(false);

        modalFixture.destroy();
    });

    it('traps focus without locking scrolling when modal=trap-focus', () => {
        const modalFixture = TestBed.createComponent(ModalHostComponent);
        modalFixture.componentInstance.modal = 'trap-focus';
        modalFixture.detectChanges();

        const modalTrigger: HTMLButtonElement = modalFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        modalTrigger.click();
        modalFixture.detectChanges();

        const focusScope = modalFixture.debugElement.query(By.directive(RdxFocusScope)).injector.get(RdxFocusScope);

        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
        expect(focusScope.isTrapped()).toBe(true);

        modalFixture.destroy();
    });

    it('updates modal behavior while the popover is open', async () => {
        // An outside sibling: a full modal isolates the background with real `inert` (finding #4),
        // not a global body pointer-lock. `trap-focus` traps focus but does not lock scroll or block
        // outside pointer interaction.
        const sibling = document.createElement('div');
        document.body.appendChild(sibling);
        const modalFixture = TestBed.createComponent(ModalHostComponent);

        try {
            modalFixture.detectChanges();

            const modalTrigger: HTMLButtonElement = modalFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
            modalTrigger.click();
            modalFixture.detectChanges();
            await modalFixture.whenStable();

            const focusScope = modalFixture.debugElement.query(By.directive(RdxFocusScope)).injector.get(RdxFocusScope);

            modalFixture.componentInstance.modal = true;
            modalFixture.changeDetectorRef.markForCheck();
            modalFixture.detectChanges();
            await modalFixture.whenStable();

            expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(true);
            expect(sibling.hasAttribute('inert')).toBe(true);
            expect(focusScope.isTrapped()).toBe(true);

            modalFixture.componentInstance.modal = 'trap-focus';
            modalFixture.changeDetectorRef.markForCheck();
            modalFixture.detectChanges();
            await modalFixture.whenStable();

            expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
            expect(sibling.hasAttribute('inert')).toBe(false);
            expect(focusScope.isTrapped()).toBe(true);

            modalFixture.componentInstance.modal = false;
            modalFixture.changeDetectorRef.markForCheck();
            modalFixture.detectChanges();

            expect(focusScope.isTrapped()).toBe(false);
            expect(sibling.hasAttribute('inert')).toBe(false);
        } finally {
            sibling.remove();
            modalFixture.destroy();
        }
    });

    it('switches the active anchor between triggers inside one root', () => {
        const multipleFixture = TestBed.createComponent(MultipleTriggersHostComponent);
        multipleFixture.detectChanges();

        const root = multipleFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
        const popper = multipleFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopper);
        const triggers: HTMLButtonElement[] = multipleFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]');

        triggers[0].click();
        multipleFixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(triggers[0]);
        expect(root.payload()).toBe('one');
        expect(popper.anchorOverride()).toBe(triggers[0]);
        expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
        expect(triggers[1].getAttribute('aria-expanded')).toBe('false');

        triggers[1].click();
        multipleFixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(triggers[1]);
        expect(root.payload()).toBe('two');
        expect(popper.anchorOverride()).toBe(triggers[1]);
        expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
        expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
    });

    it('connects detached triggers to a root through a handle', () => {
        const detachedFixture = TestBed.createComponent(DetachedTriggersHostComponent);
        detachedFixture.detectChanges();

        const root = detachedFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
        const triggers: HTMLButtonElement[] = detachedFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]');

        triggers[0].click();
        detachedFixture.detectChanges();

        expect(detachedFixture.componentInstance.handle.isOpen()).toBe(true);
        expect(root.trigger()).toBe(triggers[0]);
        expect(root.payload()).toBe('one');

        triggers[1].click();
        detachedFixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(triggers[1]);
        expect(root.payload()).toBe('two');
    });

    it('opens a detached popover imperatively against a trigger id', () => {
        const detachedFixture = TestBed.createComponent(DetachedTriggersHostComponent);
        detachedFixture.detectChanges();

        const root = detachedFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
        const popper = detachedFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopper);
        const triggers: HTMLButtonElement[] = detachedFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]');

        detachedFixture.componentInstance.handle.open('detached-two');
        detachedFixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(triggers[1]);
        expect(root.payload()).toBe('two');
        expect(popper.anchorOverride()).toBe(triggers[1]);
        expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
    });

    it('closes when its last active trigger is removed', () => {
        const removableFixture = TestBed.createComponent(RemovableTriggerHostComponent);
        removableFixture.detectChanges();

        const root = removableFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
        const removableTrigger: HTMLButtonElement = removableFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

        removableTrigger.click();
        removableFixture.detectChanges();
        expect(root.open()).toBe(true);

        removableFixture.componentInstance.showTrigger.set(false);
        removableFixture.detectChanges();

        expect(root.open()).toBe(false);
        expect(root.trigger()).toBeUndefined();
    });

    describe('openOnHover', () => {
        beforeEach(() => vi.useFakeTimers());
        afterEach(() => vi.useRealTimers());

        it('opens after the configured delay', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.detectChanges();

            const root = hoverFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

            hoverTrigger.dispatchEvent(pointerEvent('pointerenter'));
            vi.advanceTimersByTime(299);
            expect(root.open()).toBe(false);

            vi.advanceTimersByTime(1);
            expect(root.open()).toBe(true);
            expect(hoverTrigger.hasAttribute('data-pressed')).toBe(false);
        });

        it('cancels a delayed open when the pointer leaves the trigger', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.detectChanges();

            const root = hoverFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

            hoverTrigger.dispatchEvent(pointerEvent('pointerenter'));
            hoverTrigger.dispatchEvent(pointerEvent('pointerleave'));
            vi.advanceTimersByTime(300);

            expect(root.open()).toBe(false);
        });

        it('stays open while the pointer moves from the trigger into the popup', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.componentInstance.delay = 0;
            hoverFixture.detectChanges();

            const root = hoverFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

            hoverTrigger.dispatchEvent(pointerEvent('pointerenter'));
            vi.advanceTimersByTime(0);
            hoverFixture.detectChanges();

            const popup: HTMLElement = hoverFixture.nativeElement.querySelector('[rdxPopoverPopup]');
            const positioner: HTMLElement = hoverFixture.nativeElement.querySelector('[rdxPopoverPositioner]');
            hoverTrigger.dispatchEvent(pointerEvent('pointerleave', 'mouse', 0, 0));
            popup.dispatchEvent(pointerEvent('pointermove', 'mouse', 10, 10));
            vi.advanceTimersByTime(100);

            expect(root.open()).toBe(true);

            positioner.dispatchEvent(pointerEvent('pointerleave', 'mouse', 10, 10));
            document.body.dispatchEvent(pointerEvent('pointermove', 'mouse', 1000, 1000));
            vi.advanceTimersByTime(0);
            expect(root.open()).toBe(false);
        });

        it('opens immediately on click and cancels a pending hover open', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.detectChanges();

            const root = hoverFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

            hoverTrigger.dispatchEvent(pointerEvent('pointerenter'));
            hoverTrigger.click();
            expect(root.open()).toBe(true);

            vi.advanceTimersByTime(300);
            expect(root.open()).toBe(true);
        });

        it('respects the configured close delay after leaving the popup', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.componentInstance.delay = 0;
            hoverFixture.componentInstance.closeDelay = 200;
            hoverFixture.detectChanges();

            const root = hoverFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

            hoverTrigger.dispatchEvent(pointerEvent('pointerenter'));
            vi.advanceTimersByTime(0);
            hoverFixture.detectChanges();

            const popup: HTMLElement = hoverFixture.nativeElement.querySelector('[rdxPopoverPopup]');
            const positioner: HTMLElement = hoverFixture.nativeElement.querySelector('[rdxPopoverPositioner]');
            hoverTrigger.dispatchEvent(pointerEvent('pointerleave', 'mouse', 0, 0));
            popup.dispatchEvent(pointerEvent('pointermove', 'mouse', 10, 10));
            positioner.dispatchEvent(pointerEvent('pointerleave', 'mouse', 10, 10));
            document.body.dispatchEvent(pointerEvent('pointermove', 'mouse', 1000, 1000));
            vi.advanceTimersByTime(199);
            expect(root.open()).toBe(true);

            vi.advanceTimersByTime(1);
            expect(root.open()).toBe(false);
        });

        it('keeps the popover open while moving into nested popup content', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.componentInstance.delay = 0;
            hoverFixture.detectChanges();

            const root = hoverFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

            hoverTrigger.dispatchEvent(pointerEvent('pointerenter'));
            vi.advanceTimersByTime(0);
            hoverFixture.detectChanges();

            const close: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverClose]');
            hoverTrigger.dispatchEvent(pointerEvent('pointerleave', 'mouse', 0, 0));
            close.dispatchEvent(pointerEvent('pointermove', 'mouse', 10, 10));
            vi.advanceTimersByTime(300);

            expect(root.open()).toBe(true);
        });

        it('keeps a parent open while moving into a nested portaled hoverable popup', () => {
            const hoverFixture = TestBed.createComponent(NestedHoverPopupHostComponent);
            hoverFixture.detectChanges();

            const parentTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
            parentTrigger.dispatchEvent(pointerEvent('pointerenter'));
            vi.advanceTimersByTime(0);
            hoverFixture.detectChanges();

            const childTrigger: HTMLButtonElement =
                hoverFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]')[1];
            childTrigger.dispatchEvent(pointerEvent('pointerenter'));
            vi.advanceTimersByTime(0);
            hoverFixture.detectChanges();

            const roots = hoverFixture.debugElement
                .queryAll(By.directive(RdxPopoverRoot))
                .map((element) => element.injector.get(RdxPopoverRoot));
            const parentPositioner: HTMLElement = hoverFixture.nativeElement.querySelector('[rdxPopoverPositioner]');
            const childPopup: HTMLElement | null = document.body.querySelector(
                '[data-test-child-portal] [rdxPopoverPopup]'
            );

            expect(childPopup).not.toBeNull();

            parentPositioner.dispatchEvent(pointerEvent('pointerleave', 'mouse', 10, 10));
            childPopup?.dispatchEvent(pointerEvent('pointermove', 'mouse', 1000, 1000));
            vi.advanceTimersByTime(0);

            expect(roots[0].open()).toBe(true);
            hoverFixture.destroy();
        });

        it('ignores touch pointer hover events', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.detectChanges();

            const root = hoverFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopoverRoot);
            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');

            hoverTrigger.dispatchEvent(pointerEvent('pointerenter', 'touch'));
            vi.advanceTimersByTime(300);

            expect(root.open()).toBe(false);
        });

        it('prevents popup autofocus when opened by hovering', () => {
            const hoverFixture = TestBed.createComponent(HoverHostComponent);
            hoverFixture.componentInstance.delay = 0;
            hoverFixture.detectChanges();

            const hoverTrigger: HTMLButtonElement = hoverFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
            hoverTrigger.dispatchEvent(pointerEvent('pointerenter'));
            vi.advanceTimersByTime(0);
            hoverFixture.detectChanges();

            const focusScope = hoverFixture.debugElement.query(By.directive(RdxFocusScope)).injector.get(RdxFocusScope);
            const event = new Event('mountAutoFocus', { cancelable: true });
            focusScope.mountAutoFocus.emit(event);

            expect(event.defaultPrevented).toBe(true);
        });
    });

    it('retains previous viewport content while switching triggers', () => {
        const viewportFixture = TestBed.createComponent(ViewportHostComponent);
        viewportFixture.detectChanges();

        const triggers: HTMLButtonElement[] = viewportFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]');
        triggers[0].getBoundingClientRect = () => new DOMRect(0, 0, 40, 20);
        triggers[1].getBoundingClientRect = () => new DOMRect(100, 50, 40, 20);

        triggers[0].click();
        viewportFixture.detectChanges();

        const popup: HTMLElement = viewportFixture.nativeElement.querySelector('[rdxPopoverPopup]');
        popup.getBoundingClientRect = () => new DOMRect(0, 0, 240, 120);

        triggers[1].click();
        viewportFixture.detectChanges();

        const viewport: HTMLElement = viewportFixture.nativeElement.querySelector('[rdxPopoverViewport]');
        const previous: HTMLElement = viewport.querySelector('[data-previous]')!;
        const current: HTMLElement = viewport.querySelector('[data-current]')!;

        expect(viewport.getAttribute('data-activation-direction')).toBe('right down');
        expect(viewport.hasAttribute('data-transitioning')).toBe(true);
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

    describe('controlled multiple triggers', () => {
        it('positions against the externally selected trigger id', () => {
            const controlledFixture = TestBed.createComponent(ControlledMultipleTriggersHostComponent);
            controlledFixture.componentInstance.open = true;
            controlledFixture.componentInstance.triggerId = 'controlled-two';
            controlledFixture.detectChanges();

            const root = controlledFixture.debugElement
                .query(By.directive(RdxPopoverRoot))
                .injector.get(RdxPopoverRoot);
            const popper = controlledFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopper);
            const triggers: HTMLButtonElement[] =
                controlledFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]');

            expect(root.open()).toBe(true);
            expect(root.triggerId()).toBe('controlled-two');
            expect(root.trigger()).toBe(triggers[1]);
            expect(root.payload()).toBe('two');
            expect(popper.anchorOverride()).toBe(triggers[1]);
        });

        it('uses defaultTriggerId with defaultOpen', () => {
            const controlledFixture = TestBed.createComponent(ControlledMultipleTriggersHostComponent);
            controlledFixture.componentInstance.defaultOpen = true;
            controlledFixture.componentInstance.defaultTriggerId = 'controlled-two';
            controlledFixture.detectChanges();

            const root = controlledFixture.debugElement
                .query(By.directive(RdxPopoverRoot))
                .injector.get(RdxPopoverRoot);
            const triggers: HTMLButtonElement[] =
                controlledFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]');

            expect(root.open()).toBe(true);
            expect(root.triggerId()).toBe('controlled-two');
            expect(root.trigger()).toBe(triggers[1]);
            expect(root.payload()).toBe('two');
        });

        it('emits details and updates triggerId when another trigger is pressed', () => {
            const controlledFixture = TestBed.createComponent(ControlledMultipleTriggersHostComponent);
            controlledFixture.detectChanges();

            const triggers: HTMLButtonElement[] =
                controlledFixture.nativeElement.querySelectorAll('[rdxPopoverTrigger]');

            expect(controlledFixture.componentInstance.triggerId).toBeNull();

            triggers[0].click();
            controlledFixture.detectChanges();

            expect(controlledFixture.componentInstance.open).toBe(true);
            expect(controlledFixture.componentInstance.triggerId).toBe('controlled-one');
            expect(controlledFixture.componentInstance.changes[0]).toMatchObject({
                open: true,
                triggerId: 'controlled-one',
                trigger: triggers[0],
                reason: 'trigger-press'
            });

            triggers[1].click();
            controlledFixture.detectChanges();

            expect(controlledFixture.componentInstance.open).toBe(true);
            expect(controlledFixture.componentInstance.triggerId).toBe('controlled-two');
            expect(controlledFixture.componentInstance.changes[1]).toMatchObject({
                open: true,
                triggerId: 'controlled-two',
                trigger: triggers[1],
                reason: 'trigger-press'
            });
        });

        it('clears the active anchor when the externally controlled trigger id is cleared', () => {
            const controlledFixture = TestBed.createComponent(ControlledMultipleTriggersHostComponent);
            controlledFixture.componentInstance.triggerId = 'controlled-two';
            controlledFixture.detectChanges();

            const root = controlledFixture.debugElement
                .query(By.directive(RdxPopoverRoot))
                .injector.get(RdxPopoverRoot);
            const popper = controlledFixture.debugElement.query(By.directive(RdxPopoverRoot)).injector.get(RdxPopper);

            controlledFixture.componentInstance.triggerId = null;
            controlledFixture.changeDetectorRef.markForCheck();
            controlledFixture.detectChanges();

            expect(root.trigger()).toBeUndefined();
            expect(root.payload()).toBeUndefined();
            expect(popper.anchorOverride()).toBeUndefined();
        });

        it('emits close details from the popup close button', () => {
            const controlledFixture = TestBed.createComponent(ControlledMultipleTriggersHostComponent);
            controlledFixture.detectChanges();

            const trigger: HTMLButtonElement = controlledFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
            trigger.click();
            controlledFixture.detectChanges();

            const close: HTMLButtonElement = controlledFixture.nativeElement.querySelector('[rdxPopoverClose]');
            close.click();
            controlledFixture.detectChanges();

            expect(controlledFixture.componentInstance.open).toBe(false);
            expect(controlledFixture.componentInstance.changes[1]).toMatchObject({
                open: false,
                triggerId: 'controlled-one',
                trigger,
                reason: 'close-press'
            });
        });
    });
});
