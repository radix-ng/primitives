import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxFocusScope } from '../src/focus-scope';

@Component({
    imports: [RdxFocusScope],
    template: `
        <button id="opener">Open menu</button>
        @if (menu()) {
            <div [hidden]="hidden()" rdxFocusScope><button id="command">Open dialog</button></div>
        }
        @if (dialog()) {
            <div rdxFocusScope><button id="cancel">Cancel</button></div>
        }
    `
})
class RetainedReturnHost {
    readonly menu = signal(false);
    readonly dialog = signal(false);
    readonly hidden = signal(false);
}

describe('Focus Scope return through retained views', () => {
    it('skips a connected hidden command and returns to the surviving opener', async () => {
        const fixture = TestBed.createComponent(RetainedReturnHost);
        try {
            await fixture.whenStable();
            const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
            opener.focus();
            fixture.componentInstance.menu.set(true);
            await fixture.whenStable();
            await vi.waitFor(() => expect(document.activeElement?.id).toBe('command'));
            fixture.componentInstance.dialog.set(true);
            await fixture.whenStable();
            await vi.waitFor(() => expect(document.activeElement?.id).toBe('cancel'));
            fixture.componentInstance.hidden.set(true);
            await fixture.whenStable();
            fixture.componentInstance.dialog.set(false);
            await fixture.whenStable();
            await vi.waitFor(() => expect(document.activeElement).toBe(opener));
        } finally {
            fixture.destroy();
        }
    });
});
