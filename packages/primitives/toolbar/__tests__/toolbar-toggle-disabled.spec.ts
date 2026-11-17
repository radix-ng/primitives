import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxToggle } from '@radix-ng/primitives/toggle';
import { RdxToolbarButton } from '../src/toolbar-button';
import { RdxToolbarGroup } from '../src/toolbar-group';
import { RdxToolbarRoot } from '../src/toolbar-root';

@Component({
    imports: [RdxToggle, RdxToolbarButton, RdxToolbarGroup, RdxToolbarRoot],
    template: `
        <div [disabled]="owner === 'root' && disabled()" rdxToolbarRoot>
            <div [disabled]="owner === 'group' && disabled()" rdxToolbarGroup>
                @if (native) {
                    <button
                        [disabled]="owner === 'self' && disabled()"
                        [focusableWhenDisabled]="focusable()"
                        (onPressedChange)="changes = changes + 1"
                        rdxToggle
                        rdxToolbarButton
                    >
                        Bold
                    </button>
                } @else {
                    <span
                        [nativeButton]="false"
                        [disabled]="owner === 'self' && disabled()"
                        [focusableWhenDisabled]="focusable()"
                        (onPressedChange)="changes = changes + 1"
                        rdxToggle
                        rdxToolbarButton
                    >
                        Bold
                    </span>
                }
            </div>
        </div>
    `
})
class DisabledToggleHost {
    owner: 'self' | 'group' | 'root' = 'self';
    native = true;
    readonly disabled = signal(true);
    readonly focusable = signal(true);
    readonly toggle = viewChild.required(RdxToggle);
    changes = 0;
}

describe('Toolbar Toggle disabled ownership', () => {
    for (const owner of ['self', 'group', 'root'] as const) {
        for (const native of [true, false]) {
            it(`shares ${owner} disabled/focusable state on a ${native ? 'native' : 'custom'} host`, async () => {
                const fixture = TestBed.createComponent(DisabledToggleHost);
                fixture.componentInstance.owner = owner;
                fixture.componentInstance.native = native;
                fixture.detectChanges();
                const element: HTMLElement = fixture.nativeElement.querySelector(native ? 'button' : 'span');
                expect(fixture.componentInstance.toggle().isDisabled()).toBe(true);
                expect(element.hasAttribute('data-disabled')).toBe(true);
                expect(element.getAttribute('aria-disabled')).toBe('true');
                expect(element.hasAttribute('disabled')).toBe(false);
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                expect(fixture.componentInstance.changes).toBe(0);
                fixture.componentInstance.focusable.set(false);
                await fixture.whenStable();
                expect(element.hasAttribute('disabled')).toBe(native);
                expect(element.getAttribute('aria-disabled')).toBe('true');
                fixture.componentInstance.disabled.set(false);
                await fixture.whenStable();
                expect(element.hasAttribute('data-disabled')).toBe(false);
                expect(element.hasAttribute('disabled')).toBe(false);
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                expect(fixture.componentInstance.changes).toBe(1);
                fixture.componentInstance.disabled.set(true);
                fixture.componentInstance.focusable.set(true);
                await fixture.whenStable();
                expect(element.hasAttribute('disabled')).toBe(false);
                expect(element.getAttribute('aria-disabled')).toBe('true');
                element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                expect(fixture.componentInstance.changes).toBe(1);
            });
        }
    }
});
