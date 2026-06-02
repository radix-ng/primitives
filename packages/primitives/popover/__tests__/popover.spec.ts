import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFocusScope } from '@radix-ng/primitives/focus-scope';
import {
    createRdxPopoverHandle,
    RdxPopoverClose,
    RdxPopoverDescription,
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPortalPresence,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';
import { RdxPopper } from '@radix-ng/primitives/popper';

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
    imports: [RdxPopoverPortal, RdxPopoverPortalPresence, RdxPopoverRoot, RdxPopoverTrigger],
    template: `
        <div #root="rdxPopoverRoot" rdxPopoverRoot>
            <button rdxPopoverTrigger>Open</button>

            <ng-template rdxPopoverPortalPresence>
                <div data-test-popover-portal rdxPopoverPortal>Portal</div>
            </ng-template>
        </div>
    `
})
class PortalHostComponent {}

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

        expect(document.body.style.overflow).toBe('hidden');
        expect(focusScope.isTrapped()).toBe(true);

        modalFixture.destroy();
        expect(document.body.style.overflow).toBe('');
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

        expect(document.body.style.overflow).toBe('');
        expect(focusScope.isTrapped()).toBe(true);

        modalFixture.destroy();
    });

    it('updates modal behavior while the popover is open', async () => {
        const modalFixture = TestBed.createComponent(ModalHostComponent);
        modalFixture.detectChanges();

        const modalTrigger: HTMLButtonElement = modalFixture.nativeElement.querySelector('[rdxPopoverTrigger]');
        modalTrigger.click();
        modalFixture.detectChanges();
        await modalFixture.whenStable();

        const focusScope = modalFixture.debugElement.query(By.directive(RdxFocusScope)).injector.get(RdxFocusScope);

        modalFixture.componentInstance.modal = true;
        modalFixture.detectChanges();
        await modalFixture.whenStable();

        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.style.pointerEvents).toBe('none');
        expect(focusScope.isTrapped()).toBe(true);

        modalFixture.componentInstance.modal = 'trap-focus';
        modalFixture.detectChanges();
        await modalFixture.whenStable();

        expect(document.body.style.overflow).toBe('');
        expect(document.body.style.pointerEvents).toBe('');
        expect(focusScope.isTrapped()).toBe(true);

        modalFixture.componentInstance.modal = false;
        modalFixture.detectChanges();

        expect(focusScope.isTrapped()).toBe(false);

        modalFixture.destroy();
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
});
