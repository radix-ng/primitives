import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
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
});
