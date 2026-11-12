import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxMenuModule, RdxMenuRoot } from '@radix-ng/primitives/menu';
import { describe, expect, it } from 'vitest';

@Component({
    imports: [RdxMenuModule],
    template: `
        <ng-container [defaultOpen]="true" rdxMenuRoot>
            <button rdxMenuTrigger>Actions</button>
            <div rdxMenuPopup>
                @for (name of items(); track name) {
                    <button rdxMenuItem>{{ name }}</button>
                }
            </div>
        </ng-container>
    `
})
class EmptyMenu {
    readonly root = viewChild.required(RdxMenuRoot);
    readonly items = signal<string[]>([]);
}

describe('Menu empty collection navigation', () => {
    it('enters the first item from the container after an empty ArrowDown request is filled', async () => {
        TestBed.resetTestingModule();
        const fixture = TestBed.createComponent(EmptyMenu);
        fixture.autoDetectChanges();
        try {
            await fixture.whenStable();
            const popup = fixture.nativeElement.querySelector('[rdxMenuPopup]') as HTMLElement;
            popup.focus();
            popup.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
            expect(fixture.componentInstance.root().activeIndex()).toBe(0);
            fixture.componentInstance.items.set(['First', 'Second']);
            await fixture.whenStable();
            expect(document.activeElement).toBe(popup);

            popup.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

            expect(document.activeElement?.textContent?.trim()).toBe('First');
        } finally {
            fixture.destroy();
        }
    });
});
