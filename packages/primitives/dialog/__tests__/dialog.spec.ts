import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    dialogImports,
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogOpenChange,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogPortalPresence,
    RdxDialogRoot,
    RdxDialogTitle,
    RdxDialogTrigger
} from '@radix-ng/primitives/dialog';
import { axe } from 'jest-axe';

@Component({
    imports: [
        RdxDialogRoot,
        RdxDialogTrigger,
        RdxDialogPortal,
        RdxDialogPortalPresence,
        RdxDialogBackdrop,
        RdxDialogPopup,
        RdxDialogTitle,
        RdxDialogDescription,
        RdxDialogClose
    ],
    template: `
        <div
            #root="rdxDialogRoot"
            [(open)]="open"
            [defaultOpen]="defaultOpen"
            [modal]="modal"
            [disablePointerDismissal]="disablePointerDismissal"
            (onOpenChange)="changes.push($event)"
            (onOpenChangeComplete)="complete.push($event)"
            rdxDialogRoot
        >
            <button rdxDialogTrigger>Open</button>

            <ng-template rdxDialogPortalPresence>
                <div data-test-portal rdxDialogPortal>
                    <div data-test-backdrop rdxDialogBackdrop></div>
                    <div rdxDialogPopup>
                        <h2 rdxDialogTitle>Title</h2>
                        <p rdxDialogDescription>Description</p>
                        <button rdxDialogClose>Close</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
class TestHostComponent {
    open = false;
    defaultOpen = false;
    modal: boolean | 'trap-focus' = true;
    disablePointerDismissal = false;
    readonly changes: RdxDialogOpenChange[] = [];
    readonly complete: boolean[] = [];
}

@Component({
    imports: [RdxDialogRoot, RdxDialogTrigger, RdxDialogPortal, RdxDialogPortalPresence, RdxDialogPopup],
    template: `
        <div [defaultOpen]="true" rdxDialogRoot>
            <button rdxDialogTrigger>Open</button>
            <ng-template rdxDialogPortalPresence>
                <div rdxDialogPortal>
                    <div rdxDialogPopup>Popup</div>
                </div>
            </ng-template>
        </div>
    `
})
class DefaultOpenHostComponent {}

function popup(): HTMLElement | null {
    return document.body.querySelector('[rdxDialogPopup]');
}

describe('Dialog', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let trigger: HTMLButtonElement;

    beforeEach(() => {
        document.body.style.overflow = '';
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxDialogTrigger]');
    });

    afterEach(() => {
        fixture.destroy();
        document.body.style.overflow = '';
    });

    it('exports all parts via dialogImports', () => {
        expect(dialogImports).toContain(RdxDialogRoot);
        expect(dialogImports).toContain(RdxDialogPopup);
    });

    it('opens and closes from the trigger', () => {
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
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
        // Closing via the trigger is a trigger press, distinct from a Close button ('close-press').
        expect(fixture.componentInstance.changes.at(-1)).toMatchObject({ open: false, reason: 'trigger-press' });
    });

    it('mounts the portal content in the document body while open', () => {
        expect(document.body.querySelector('[data-test-portal]')).toBeNull();

        trigger.click();
        fixture.detectChanges();

        expect(document.body.querySelector('[data-test-portal]')).not.toBeNull();
        expect(popup()).not.toBeNull();
    });

    it('links the trigger and popup with accessible ids and roles', () => {
        trigger.click();
        fixture.detectChanges();

        const dialog = popup()!;
        const title: HTMLElement = document.body.querySelector('[rdxDialogTitle]')!;
        const description: HTMLElement = document.body.querySelector('[rdxDialogDescription]')!;

        expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
        expect(dialog.getAttribute('role')).toBe('dialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
        expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
        expect(dialog.hasAttribute('data-open')).toBe(true);
    });

    it('closes from the close button', () => {
        trigger.click();
        fixture.detectChanges();

        const close: HTMLButtonElement = document.body.querySelector('[rdxDialogClose]')!;
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
        expect(fixture.componentInstance.changes.at(-1)?.reason).toBe('escape-key');
    });

    it('closes when a pointerdown happens outside (modal, dismissible)', async () => {
        trigger.click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));

        document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('does not close on outside pointerdown when disablePointerDismissal is set', async () => {
        fixture.componentInstance.disablePointerDismissal = true;
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));

        document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(true);

        // Escape still closes.
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('locks body scroll while a modal dialog is open and restores it on close', () => {
        expect(document.body.style.overflow).toBe('');

        trigger.click();
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('hidden');

        trigger.click();
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('');
    });

    it('does not lock body scroll for a non-modal dialog', () => {
        fixture.componentInstance.modal = false;
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('');

        const dialog = popup()!;
        expect(dialog.hasAttribute('aria-modal')).toBe(false);
    });

    it('closes (not reopens) when the trigger of an open non-modal dialog is clicked', async () => {
        fixture.componentInstance.modal = false;
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));
        expect(fixture.componentInstance.open).toBe(true);

        // A pointerdown on the trigger reaches the dismissable layer as an outside press;
        // it must be ignored so the trigger's own click toggles closed instead of close+reopen.
        trigger.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
        trigger.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('uses defaultOpen for uncontrolled state', () => {
        const defaultOpenFixture = TestBed.createComponent(DefaultOpenHostComponent);
        defaultOpenFixture.detectChanges();

        const defaultOpenTrigger: HTMLButtonElement =
            defaultOpenFixture.nativeElement.querySelector('[rdxDialogTrigger]');

        expect(defaultOpenTrigger.getAttribute('aria-expanded')).toBe('true');
        expect(document.body.querySelector('[rdxDialogPopup]')).not.toBeNull();
        defaultOpenFixture.destroy();
    });

    it('supports controlled open via the model', () => {
        fixture.componentInstance.open = true;
        fixture.detectChanges();

        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(popup()).not.toBeNull();

        fixture.componentInstance.open = false;
        fixture.detectChanges();
    });

    it('emits onOpenChange and onOpenChangeComplete', async () => {
        trigger.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.changes.at(-1)).toMatchObject({ open: true, reason: 'trigger-press' });

        await new Promise((resolve) => setTimeout(resolve, 30));
        fixture.detectChanges();

        expect(fixture.componentInstance.complete).toEqual([true]);
    });

    it('has no accessibility violations when open', async () => {
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(await axe(popup()!)).toHaveNoViolations();
    });
});
