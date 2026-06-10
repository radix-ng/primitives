import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    alertDialogImports,
    createRdxAlertDialogHandle,
    RdxAlertDialogBackdrop,
    RdxAlertDialogClose,
    RdxAlertDialogDescription,
    RdxAlertDialogPopup,
    RdxAlertDialogPortal,
    RdxAlertDialogPortalPresence,
    RdxAlertDialogRoot,
    RdxAlertDialogTitle,
    RdxAlertDialogTrigger
} from '@radix-ng/primitives/alert-dialog';
import { axe } from 'jest-axe';

@Component({
    imports: [
        RdxAlertDialogRoot,
        RdxAlertDialogTrigger,
        RdxAlertDialogPortal,
        RdxAlertDialogPortalPresence,
        RdxAlertDialogBackdrop,
        RdxAlertDialogPopup,
        RdxAlertDialogTitle,
        RdxAlertDialogDescription,
        RdxAlertDialogClose
    ],
    template: `
        <div [(open)]="open" (onOpenChange)="changes.push($event.reason)" rdxAlertDialogRoot>
            <button rdxAlertDialogTrigger>Delete</button>

            <ng-template rdxAlertDialogPortalPresence>
                <div rdxAlertDialogPortal>
                    <div rdxAlertDialogBackdrop></div>
                    <div rdxAlertDialogPopup>
                        <h2 rdxAlertDialogTitle>Are you sure?</h2>
                        <p rdxAlertDialogDescription>This cannot be undone.</p>
                        <button rdxAlertDialogClose>Cancel</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
class TestHostComponent {
    open = false;
    readonly changes: string[] = [];
}

@Component({
    imports: [
        RdxAlertDialogTrigger,
        RdxAlertDialogRoot,
        RdxAlertDialogPortal,
        RdxAlertDialogPortalPresence,
        RdxAlertDialogPopup
    ],
    template: `
        <button id="detached" [handle]="handle" rdxAlertDialogTrigger>Open</button>
        <div [handle]="handle" rdxAlertDialogRoot>
            <ng-template rdxAlertDialogPortalPresence>
                <div rdxAlertDialogPortal>
                    <div rdxAlertDialogPopup>Popup</div>
                </div>
            </ng-template>
        </div>
    `
})
class DetachedHostComponent {
    readonly handle = createRdxAlertDialogHandle();
}

function popup(): HTMLElement | null {
    return document.body.querySelector('[rdxAlertDialogPopup]');
}

describe('AlertDialog', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let trigger: HTMLButtonElement;

    beforeEach(() => {
        document.body.style.overflow = '';
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxAlertDialogTrigger]');
    });

    afterEach(() => {
        fixture.destroy();
        document.body.style.overflow = '';
    });

    it('exports parts via alertDialogImports', () => {
        expect(alertDialogImports).toContain(RdxAlertDialogRoot);
        expect(alertDialogImports).toContain(RdxAlertDialogPopup);
    });

    it('opens from the trigger with role="alertdialog" and aria-modal', () => {
        trigger.click();
        fixture.detectChanges();

        const dialog = popup()!;
        const title: HTMLElement = document.body.querySelector('[rdxAlertDialogTitle]')!;
        const description: HTMLElement = document.body.querySelector('[rdxAlertDialogDescription]')!;

        expect(fixture.componentInstance.open).toBe(true);
        expect(dialog.getAttribute('role')).toBe('alertdialog');
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
        expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
    });

    it('does NOT close on an outside pointerdown (alert invariant)', async () => {
        trigger.click();
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));

        document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(true);
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

    it('closes from the close button', () => {
        trigger.click();
        fixture.detectChanges();

        const close: HTMLButtonElement = document.body.querySelector('[rdxAlertDialogClose]')!;
        close.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
    });

    it('locks body scroll while open (always modal)', () => {
        expect(document.body.style.overflow).toBe('');

        trigger.click();
        fixture.detectChanges();
        expect(document.body.style.overflow).toBe('hidden');

        const close: HTMLButtonElement = document.body.querySelector('[rdxAlertDialogClose]')!;
        close.click();
        fixture.detectChanges();
        expect(document.body.style.overflow).toBe('');
    });

    it('supports controlled open via the model', () => {
        fixture.componentInstance.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(popup()).not.toBeNull();
    });

    it('controls an alert dialog from a detached trigger handle', () => {
        const detachedFixture = TestBed.createComponent(DetachedHostComponent);
        detachedFixture.detectChanges();

        const handle = detachedFixture.componentInstance.handle;
        const detached: HTMLButtonElement = detachedFixture.nativeElement.querySelector('#detached');

        detached.click();
        detachedFixture.detectChanges();

        expect(handle.isOpen()).toBe(true);
        expect(document.body.querySelector('[rdxAlertDialogPopup]')).not.toBeNull();
        detachedFixture.destroy();
    });

    it('has no accessibility violations when open', async () => {
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(await axe(popup()!)).toHaveNoViolations();
    });
});
