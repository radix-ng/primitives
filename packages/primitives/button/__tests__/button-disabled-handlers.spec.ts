import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxButtonDirective } from '../src/button.directive';

@Component({
    imports: [RdxButtonDirective],
    template: `
        <button
            [disabled]="disabled()"
            (pointerup)="record($event)"
            (mouseup)="record($event)"
            (mousemove)="record($event)"
            (pointerdown)="record($event)"
            (mousedown)="record($event)"
            (click)="record($event)"
            (keydown)="record($event)"
            (keyup)="record($event)"
            rdxButton
            focusableWhenDisabled
        >
            Native
        </button>
        <span
            [disabled]="disabled()"
            (pointerup)="record($event)"
            (mouseup)="record($event)"
            (mousemove)="record($event)"
            (pointerdown)="record($event)"
            (mousedown)="record($event)"
            (click)="record($event)"
            (keydown)="record($event)"
            (keyup)="record($event)"
            rdxButton
            focusableWhenDisabled
        >
            Custom
        </span>
    `
})
class DisabledHost {
    readonly disabled = signal(true);
    readonly events: string[] = [];
    record(event: Event) {
        this.events.push(event.type);
    }
}

function dispatchHandlers(element: HTMLElement) {
    for (const type of ['pointerdown', 'mousedown', 'click'])
        element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
    for (const type of ['keydown', 'keyup'])
        element.dispatchEvent(new KeyboardEvent(type, { key: 'Escape', bubbles: true, cancelable: true }));
}

describe('Button disabled consumer handlers', () => {
    it('keeps hover and release handlers available while disabled', () => {
        const fixture = TestBed.createComponent(DisabledHost);
        fixture.detectChanges();
        const element: HTMLElement = fixture.nativeElement.querySelector('span');
        for (const type of ['pointerup', 'mouseup', 'mousemove'])
            element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
        expect(fixture.componentInstance.events).toEqual(['pointerup', 'mouseup', 'mousemove']);
    });
    for (const tag of ['button', 'span']) {
        it(`suppresses pointer, mouse and key handlers on a focusable disabled ${tag}, then restores them`, async () => {
            const fixture = TestBed.createComponent(DisabledHost);
            fixture.detectChanges();
            const element: HTMLElement = fixture.nativeElement.querySelector(tag);
            dispatchHandlers(element);
            expect(fixture.componentInstance.events).toEqual([]);
            fixture.componentInstance.disabled.set(false);
            await fixture.whenStable();
            dispatchHandlers(element);
            expect(fixture.componentInstance.events).toEqual(['pointerdown', 'mousedown', 'click', 'keydown', 'keyup']);
            fixture.componentInstance.disabled.set(true);
            await fixture.whenStable();
            fixture.componentInstance.events.length = 0;
            dispatchHandlers(element);
            expect(fixture.componentInstance.events).toEqual([]);
        });
    }
});
