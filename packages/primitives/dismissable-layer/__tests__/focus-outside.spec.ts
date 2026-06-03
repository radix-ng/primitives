import { RdxFocusOutside } from '../src/utils';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxFocusOutside],
    template: `
        <div>
            <button id="outside">Outside Button</button>
            <div rdxFocusOutside [enabled]="enabled" (focusOutside)="onFocusOutside($event)">
                <button id="inside">Inside Button</button>
            </div>
        </div>
    `
})
class TestComponent {
    enabled = true;
    onFocusOutside = vi.fn();
}

// The focusin handler defers two microtasks before deciding; flush a few to let it settle.
async function flushMicrotasks(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
}

describe('RdxFocusOutside', () => {
    let fixture: ComponentFixture<TestComponent>;
    let host: TestComponent;
    let insideButton: HTMLElement;
    let outsideButton: HTMLElement;

    function setup(enabled = true) {
        fixture = TestBed.createComponent(TestComponent);
        host = fixture.componentInstance;
        host.enabled = enabled;
        fixture.detectChanges();

        insideButton = fixture.debugElement.query(By.css('#inside')).nativeElement;
        outsideButton = fixture.debugElement.query(By.css('#outside')).nativeElement;
    }

    function dispatchFocus(element: HTMLElement, type: 'focus' | 'blur' | 'focusin'): void {
        element.dispatchEvent(new FocusEvent(type, { bubbles: true, composed: true }));
    }

    it('emits when focus moves from inside to an outside element', async () => {
        setup();

        dispatchFocus(insideButton, 'focus'); // focus enters the subtree
        dispatchFocus(insideButton, 'blur'); // focus leaves the subtree
        dispatchFocus(outsideButton, 'focusin'); // lands outside
        await flushMicrotasks();

        expect(host.onFocusOutside).toHaveBeenCalledTimes(1);
    });

    it('does NOT emit while focus stays inside the subtree', async () => {
        setup();

        dispatchFocus(insideButton, 'focus');
        dispatchFocus(insideButton, 'focusin');
        await flushMicrotasks();

        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });

    it('does NOT emit when disabled', async () => {
        setup(false);

        dispatchFocus(insideButton, 'focus');
        dispatchFocus(insideButton, 'blur');
        dispatchFocus(outsideButton, 'focusin');
        await flushMicrotasks();

        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });

    it('cleans up the listeners on destroy', async () => {
        setup();

        fixture.destroy();

        dispatchFocus(insideButton, 'focus');
        dispatchFocus(insideButton, 'blur');
        dispatchFocus(outsideButton, 'focusin');
        await flushMicrotasks();

        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });
});
