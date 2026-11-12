// @vitest-environment jsdom
import { Component, Directive, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxPortalPresence } from '@radix-ng/primitives/portal';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { afterEach, describe, expect, it } from 'vitest';
import { RdxFloatingFocusManager } from '../src/floating-focus-manager';

@Directive({
    selector: 'ng-template[testFocusPortal]',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container', 'keepMounted'] }]
})
class TestFocusPortal {}

@Component({
    imports: [TestFocusPortal, RdxFloatingFocusManager],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PortalFocusHost).open }))],
    template: `
        <button id="before">Before</button>
        <ng-template [container]="destination" [keepMounted]="true" testFocusPortal>
            <div
                id="popup"
                [enabled]="open()"
                [modal]="modal()"
                [initialFocus]="false"
                [returnFocus]="false"
                (focusOut)="events.push($event)"
                rdxFloatingFocusManager
            >
                <button id="inside">Inside</button>
            </div>
        </ng-template>
        <button id="after">After</button>
        <div id="destination" #destination></div>
    `
})
class PortalFocusHost {
    readonly open = signal(true);
    readonly modal = signal(false);
    readonly events: FocusEvent[] = [];
}

describe('structural portal focus bridge', () => {
    afterEach(() => TestBed.resetTestingModule());

    for (const backward of [false, true]) {
        it(`hands ${backward ? 'backward' : 'forward'} focus through the declaration position once`, async () => {
            const fixture = TestBed.createComponent(PortalFocusHost);
            fixture.autoDetectChanges();
            await fixture.whenStable();
            const root = fixture.nativeElement as HTMLElement;
            const popup = root.querySelector<HTMLElement>('#popup')!;
            const inside = root.querySelector<HTMLButtonElement>('#inside')!;
            const outside = root.querySelector<HTMLButtonElement>(backward ? '#before' : '#after')!;
            expect(popup.parentElement?.id).toBe('destination');
            expect(root.querySelectorAll('[data-type="outside"]')).toHaveLength(2);
            inside.focus();
            const contentGuard = (backward ? popup.previousElementSibling : popup.nextElementSibling) as HTMLElement;
            contentGuard.focus();
            expect(document.activeElement).toBe(outside);
            expect(fixture.componentInstance.events).toHaveLength(1);
            expect(fixture.componentInstance.events[0].type).toBe('focus');
            expect(fixture.componentInstance.events[0].target).toHaveAttribute('data-rdx-focus-guard');
            fixture.destroy();
        });
    }

    it('removes logical guards while retained content is closed or modal, and on destruction', async () => {
        const fixture = TestBed.createComponent(PortalFocusHost);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;
        const guards = () => root.querySelectorAll('[data-rdx-focus-guard]');
        expect(guards()).toHaveLength(4);
        fixture.componentInstance.open.set(false);
        await fixture.whenStable();
        expect(root.querySelector('#popup')).not.toBeNull();
        expect(guards()).toHaveLength(0);
        fixture.componentInstance.open.set(true);
        await fixture.whenStable();
        expect(guards()).toHaveLength(4);
        fixture.componentInstance.modal.set(true);
        await fixture.whenStable();
        expect(root.querySelectorAll('[data-type="outside"]')).toHaveLength(0);
        fixture.componentInstance.modal.set(false);
        await fixture.whenStable();
        expect(guards()).toHaveLength(4);
        fixture.destroy();
        expect(guards()).toHaveLength(0);
    });
});
