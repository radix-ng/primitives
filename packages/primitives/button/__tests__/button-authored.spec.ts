import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxButtonDirective } from '../src/button.directive';

@Component({
    imports: [RdxButtonDirective],
    template: `
        <button role="menuitem" tabindex="-1" rdxButton>Native</button>
        <span role="menuitem" tabindex="-1" rdxButton>Custom</span>
    `
})
class StaticHost {}

@Component({
    imports: [RdxButtonDirective],
    template: `
        <button
            [role]="role()"
            [tabIndex]="tabIndex()"
            [disabled]="disabled()"
            [focusableWhenDisabled]="focusable()"
            rdxButton
        >
            Native
        </button>
        <span
            [role]="role()"
            [tabIndex]="tabIndex()"
            [disabled]="disabled()"
            [focusableWhenDisabled]="focusable()"
            rdxButton
        >
            Custom
        </span>
    `
})
class BoundHost {
    readonly role = signal<string | null | undefined>('menuitem');
    readonly tabIndex = signal<number | null | undefined>(3);
    readonly disabled = signal(false);
    readonly focusable = signal(false);
}

describe('Button authored role and tabIndex', () => {
    it('preserves static role and lowercase tabindex on native and custom hosts', () => {
        const fixture = TestBed.createComponent(StaticHost);
        fixture.detectChanges();
        for (const element of fixture.nativeElement.querySelectorAll('button, span')) {
            expect(element.getAttribute('role')).toBe('menuitem');
            expect(element.getAttribute('tabindex')).toBe('-1');
        }
    });
    it('preserves authored role and tabIndex through disabled and focusable transitions', async () => {
        const fixture = TestBed.createComponent(BoundHost);
        fixture.detectChanges();
        for (const [disabled, focusable] of [
            [false, false],
            [true, false],
            [true, true],
            [false, true],
            [false, false]
        ]) {
            fixture.componentInstance.disabled.set(disabled);
            fixture.componentInstance.focusable.set(focusable);
            await fixture.whenStable();
            for (const element of fixture.nativeElement.querySelectorAll('button, span')) {
                expect(element.getAttribute('role')).toBe('menuitem');
                expect(element.getAttribute('tabindex')).toBe('3');
            }
        }
    });
    it('updates authored values and distinguishes null removal from undefined defaults', async () => {
        const fixture = TestBed.createComponent(BoundHost);
        fixture.detectChanges();
        fixture.componentInstance.role.set('option');
        fixture.componentInstance.tabIndex.set(-1);
        await fixture.whenStable();
        for (const element of fixture.nativeElement.querySelectorAll('button, span')) {
            expect(element.getAttribute('role')).toBe('option');
            expect(element.getAttribute('tabindex')).toBe('-1');
        }
        fixture.componentInstance.role.set(null);
        fixture.componentInstance.tabIndex.set(null);
        await fixture.whenStable();
        for (const element of fixture.nativeElement.querySelectorAll('button, span')) {
            expect(element.hasAttribute('role')).toBe(false);
            expect(element.hasAttribute('tabindex')).toBe(false);
        }
        fixture.componentInstance.role.set(undefined);
        fixture.componentInstance.tabIndex.set(undefined);
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('button').getAttribute('role')).toBeNull();
        expect(fixture.nativeElement.querySelector('span').getAttribute('role')).toBe('button');
        for (const element of fixture.nativeElement.querySelectorAll('button, span'))
            expect(element.getAttribute('tabindex')).toBe('0');
    });
});
