import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    createRdxDialogHandle,
    dialogImports,
    RdxDialogBackdrop,
    RdxDialogClose,
    RdxDialogDescription,
    RdxDialogOpenChange,
    RdxDialogPopup,
    RdxDialogPortal,
    RdxDialogPortalMisuseGuard,
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

            <ng-template rdxDialogPortal>
                <div data-test-backdrop rdxDialogBackdrop></div>
                <div data-test-portal rdxDialogPopup>
                    <h2 rdxDialogTitle>Title</h2>
                    <p rdxDialogDescription>Description</p>
                    <button rdxDialogClose>Close</button>
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
    imports: [RdxDialogRoot, RdxDialogTrigger, RdxDialogPortal, RdxDialogPopup],
    template: `
        <div [defaultOpen]="true" rdxDialogRoot>
            <button rdxDialogTrigger>Open</button>
            <ng-template rdxDialogPortal>
                <div rdxDialogPopup>Popup</div>
            </ng-template>
        </div>
    `
})
class DefaultOpenHostComponent {}

@Component({
    imports: [RdxDialogRoot, RdxDialogTrigger, RdxDialogPortal, RdxDialogPopup],
    template: `
        <div #root="rdxDialogRoot" [(open)]="open" [(triggerId)]="triggerId" rdxDialogRoot>
            <button id="trigger-one" rdxDialogTrigger>One</button>
            <button id="trigger-two" rdxDialogTrigger>Two</button>
            <ng-template rdxDialogPortal>
                <div rdxDialogPopup>Popup</div>
            </ng-template>
        </div>
    `
})
class MultipleTriggersHostComponent {
    open = false;
    triggerId: string | null = null;
}

@Component({
    imports: [RdxDialogRoot, RdxDialogTrigger, RdxDialogPortal, RdxDialogPopup],
    template: `
        <button id="detached-one" [handle]="handle" rdxDialogTrigger>One</button>
        <button id="detached-two" [handle]="handle" rdxDialogTrigger>Two</button>
        <div [handle]="handle" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div rdxDialogPopup>Popup</div>
            </ng-template>
        </div>
    `
})
class DetachedTriggersHostComponent {
    readonly handle = createRdxDialogHandle();
}

@Component({
    imports: [RdxDialogRoot, RdxDialogTrigger, RdxDialogPortal, RdxDialogPopup],
    template: `
        <div rdxDialogRoot>
            <button id="outer-trigger" rdxDialogTrigger>Open outer</button>
            <ng-template rdxDialogPortal>
                <div data-test-outer rdxDialogPopup>
                    <div rdxDialogRoot>
                        <button id="inner-trigger" rdxDialogTrigger>Open inner</button>
                        <ng-template rdxDialogPortal>
                            <div data-test-inner rdxDialogPopup>Inner</div>
                        </ng-template>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
class NestedDialogHostComponent {}

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

    it('throws in dev mode when rdxDialogPortal is used as an attribute instead of structurally', () => {
        @Component({
            imports: [RdxDialogRoot, RdxDialogTrigger, RdxDialogPortal, RdxDialogPortalMisuseGuard, RdxDialogPopup],
            template: `
                <div rdxDialogRoot>
                    <button rdxDialogTrigger>Open</button>

                    <div rdxDialogPortal>
                        <div rdxDialogPopup>Oops</div>
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

    it('closes when an outside press completes (modal with backdrop → intentional, closes on click)', async () => {
        trigger.click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));

        // A modal dialog with a backdrop uses `intentional` outside-press (Base UI): it closes on the
        // full `click`, not the bare `pointerdown` (so a text-selection drag out of the popup can't
        // dismiss it). A lone pointerdown must NOT close it.
        document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();
        expect(fixture.componentInstance.open).toBe(true);

        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        fixture.detectChanges();
        expect(fixture.componentInstance.open).toBe(false);
    });

    it('does not close on outside pointerdown when disablePointerDismissal is set', async () => {
        fixture.componentInstance.disablePointerDismissal = true;
        fixture.changeDetectorRef.markForCheck();
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
        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);

        trigger.click();
        fixture.detectChanges();

        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(true);

        trigger.click();
        fixture.detectChanges();

        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);
    });

    it('does not lock body scroll for a non-modal dialog', () => {
        fixture.componentInstance.modal = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        trigger.click();
        fixture.detectChanges();

        expect(document.documentElement.hasAttribute('data-rdx-scroll-locked')).toBe(false);

        const dialog = popup()!;
        expect(dialog.hasAttribute('aria-modal')).toBe(false);
    });

    it('closes (not reopens) when the trigger of an open non-modal dialog is clicked', async () => {
        fixture.componentInstance.modal = false;
        fixture.changeDetectorRef.markForCheck();
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
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(popup()).not.toBeNull();

        fixture.componentInstance.open = false;
        fixture.changeDetectorRef.markForCheck();
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

    it('opens a single dialog from multiple triggers and tracks the active triggerId', () => {
        const multiFixture = TestBed.createComponent(MultipleTriggersHostComponent);
        multiFixture.detectChanges();

        const one: HTMLButtonElement = multiFixture.nativeElement.querySelector('#trigger-one');
        const two: HTMLButtonElement = multiFixture.nativeElement.querySelector('#trigger-two');

        two.click();
        multiFixture.detectChanges();

        expect(multiFixture.componentInstance.open).toBe(true);
        expect(multiFixture.componentInstance.triggerId).toBe('trigger-two');
        expect(two.getAttribute('aria-expanded')).toBe('true');
        expect(one.getAttribute('aria-expanded')).toBe('false');
        multiFixture.destroy();
    });

    it('clears the active trigger when a controlled triggerId is reset to null', () => {
        const multiFixture = TestBed.createComponent(MultipleTriggersHostComponent);
        multiFixture.detectChanges();

        const two: HTMLButtonElement = multiFixture.nativeElement.querySelector('#trigger-two');
        two.click();
        multiFixture.detectChanges();
        expect(two.getAttribute('aria-expanded')).toBe('true');

        multiFixture.componentInstance.triggerId = null;
        multiFixture.changeDetectorRef.markForCheck();
        multiFixture.detectChanges();

        // No trigger is active anymore, so neither button reports itself as expanded.
        expect(two.getAttribute('aria-expanded')).toBe('false');
        multiFixture.destroy();
    });

    it('controls a dialog from detached triggers through a handle', () => {
        const detachedFixture = TestBed.createComponent(DetachedTriggersHostComponent);
        detachedFixture.detectChanges();

        const handle = detachedFixture.componentInstance.handle;
        expect(handle.isOpen()).toBe(false);

        const one: HTMLButtonElement = detachedFixture.nativeElement.querySelector('#detached-one');
        one.click();
        detachedFixture.detectChanges();

        expect(handle.isOpen()).toBe(true);
        expect(document.body.querySelector('[rdxDialogPopup]')).not.toBeNull();

        handle.close();
        detachedFixture.detectChanges();
        expect(handle.isOpen()).toBe(false);
        detachedFixture.destroy();
    });

    it('marks nested dialogs with data-nested and data-nested-dialog-open', () => {
        const nestedFixture = TestBed.createComponent(NestedDialogHostComponent);
        nestedFixture.detectChanges();

        const outerTrigger: HTMLButtonElement = nestedFixture.nativeElement.querySelector('#outer-trigger');
        outerTrigger.click();
        nestedFixture.detectChanges();

        const outer: HTMLElement = document.body.querySelector('[data-test-outer]')!;
        expect(outer.hasAttribute('data-nested')).toBe(false);
        expect(outer.hasAttribute('data-nested-dialog-open')).toBe(false);

        const innerTrigger: HTMLButtonElement = document.body.querySelector('#inner-trigger')!;
        innerTrigger.click();
        nestedFixture.detectChanges();

        const inner: HTMLElement = document.body.querySelector('[data-test-inner]')!;
        expect(inner.hasAttribute('data-nested')).toBe(true);
        expect(outer.hasAttribute('data-nested-dialog-open')).toBe(true);
        nestedFixture.destroy();
    });
});
