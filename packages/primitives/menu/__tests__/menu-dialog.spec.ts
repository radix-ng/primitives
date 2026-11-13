import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dialogImports } from '@radix-ng/primitives/dialog';
import { menuImports, type RdxMenuOpenChange } from '../index';

@Component({
    imports: [...menuImports, ...dialogImports],
    template: `
        <ng-container (onOpenChange)="change($event)" rdxMenuRoot>
            <button id="trigger" rdxMenuTrigger>Actions</button>
            <ng-template rdxMenuPortal>
                <div rdxMenuPositioner>
                    <div rdxMenuPopup>
                        <button id="launch" (onSelect)="dialog.set(true)" rdxMenuItem>Open dialog</button>
                    </div>
                </div>
            </ng-template>
        </ng-container>
        <ng-container [(open)]="dialog" rdxDialogRoot>
            <ng-template rdxDialogPortal>
                <div rdxDialogPopup><button id="cancel" rdxDialogClose>Cancel</button></div>
            </ng-template>
        </ng-container>
    `
})
class MenuDialogHost {
    readonly dialog = signal(false);
    readonly changes: string[] = [];
    change(change: RdxMenuOpenChange) {
        this.changes.push(change.reason);
        if (!change.open) change.eventDetails.cancel();
    }
}

describe('Menu to independent Dialog ownership', () => {
    it('keeps the vetoed Menu open without receiving the Dialog Escape or focus-out', async () => {
        const fixture = TestBed.createComponent(MenuDialogHost);
        try {
            await fixture.whenStable();
            fixture.nativeElement.querySelector('#trigger').click();
            await fixture.whenStable();
            await vi.waitFor(() => expect(document.querySelector('#launch')).not.toBeNull());
            (document.querySelector('#launch') as HTMLButtonElement).click();
            await fixture.whenStable();
            await vi.waitFor(() => expect(document.activeElement?.id).toBe('cancel'));
            expect(fixture.componentInstance.changes).toEqual(['trigger-press', 'item-press']);
            document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            await fixture.whenStable();
            await vi.waitFor(() => expect(fixture.componentInstance.dialog()).toBe(false));
            expect(fixture.componentInstance.changes).toEqual(['trigger-press', 'item-press']);
            expect(document.querySelector('[rdxMenuPopup][data-open]')).not.toBeNull();
        } finally {
            fixture.destroy();
        }
    });
});
