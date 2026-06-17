// @vitest-environment jsdom
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RdxReturnFocus } from '../../floating-focus-manager';
import { _importsSelect } from '../index';

const flush = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

@Component({
    imports: [_importsSelect],
    template: `
        <input data-testid="before" />
        <div [(value)]="value" [(open)]="open" rdxSelectRoot>
            <button rdxSelectTrigger>Open</button>
            <div *rdxSelectPortal rdxSelectPositioner>
                <div [finalFocus]="finalFocus()" rdxSelectPopup>
                    <div rdxSelectList>
                        <div value="apple" rdxSelectItem>
                            <span rdxSelectItemText>Apple</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <input #after data-testid="after" />
    `
})
class SelectFocusHost {
    readonly value = signal<string | undefined>(undefined);
    readonly open = signal(false);
    readonly finalFocus = signal<RdxReturnFocus | undefined>(undefined);
}

describe('Select popup focus manager', () => {
    let fixture: ComponentFixture<SelectFocusHost>;
    let host: SelectFocusHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        await flush();
    }

    function trigger(): HTMLButtonElement {
        return fixture.nativeElement.querySelector('[rdxSelectTrigger]');
    }

    async function openSelect(): Promise<void> {
        trigger().focus();
        trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();
    }

    function popup(): HTMLElement {
        return document.querySelector('[rdxSelectPopup]') as HTMLElement;
    }

    async function selectHighlightedItem(): Promise<void> {
        popup().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SelectFocusHost] });
        fixture = TestBed.createComponent(SelectFocusHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('uses FloatingFocusManager initial focus and focuses the listbox while open', async () => {
        await openSelect();

        expect(document.activeElement).toBe(popup());
    });

    it('returns focus to the trigger by default when closed', async () => {
        await openSelect();

        await selectHighlightedItem();

        expect(document.activeElement).toBe(trigger());
    });

    it('supports finalFocus as an explicit element', async () => {
        const after = fixture.nativeElement.querySelector('[data-testid="after"]') as HTMLInputElement;
        host.finalFocus.set(after);
        await openSelect();

        await selectHighlightedItem();

        expect(document.activeElement).toBe(after);
    });

    it('supports finalFocus as a close-interaction callback', async () => {
        const after = fixture.nativeElement.querySelector('[data-testid="after"]') as HTMLInputElement;
        host.finalFocus.set((closeType) => (closeType === 'keyboard' ? after : false));
        trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();

        popup().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();

        expect(document.activeElement).toBe(after);
    });

    it('does not move focus when finalFocus is false', async () => {
        host.finalFocus.set(false);
        await openSelect();

        await selectHighlightedItem();

        expect(document.activeElement).not.toBe(trigger());
    });

    it('restores focus to the popup when focus is lost inside while open', async () => {
        await openSelect();

        popup().blur();
        popup().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
        await flush();

        expect(document.activeElement).toBe(popup());
    });
});
