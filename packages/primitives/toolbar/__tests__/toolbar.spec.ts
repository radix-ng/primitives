import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxToolbarButton } from '../src/toolbar-button';
import { RdxToolbarGroup } from '../src/toolbar-group';
import { RdxToolbarInput } from '../src/toolbar-input';
import { RdxToolbarLink } from '../src/toolbar-link';
import { RdxToolbarRoot } from '../src/toolbar-root';
import { RdxToolbarSeparator } from '../src/toolbar-separator';

@Component({
    imports: [RdxToolbarRoot, RdxToolbarButton, RdxToolbarLink, RdxToolbarSeparator, RdxToolbarGroup],
    template: `
        <div [orientation]="orientation()" [disabled]="rootDisabled()" rdxToolbarRoot aria-label="Formatting">
            <div [disabled]="groupDisabled()" rdxToolbarGroup>
                <button rdxToolbarButton>Bold</button>
                <button [disabled]="boldDisabled()" rdxToolbarButton>Italic</button>
            </div>
            <div rdxToolbarSeparator orientation="vertical"></div>
            <a href="#" rdxToolbarLink>Link</a>
            <button rdxToolbarButton>Share</button>
        </div>
    `
})
class TestComponent {
    readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
    readonly rootDisabled = signal(false);
    readonly groupDisabled = signal(false);
    readonly boldDisabled = signal(false);
}

describe('Toolbar', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    const root = () => fixture.debugElement.query(By.css('[rdxToolbarRoot]')).nativeElement as HTMLElement;
    const buttons = () =>
        fixture.debugElement.queryAll(By.css('[rdxToolbarButton]')).map((d) => d.nativeElement as HTMLButtonElement);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestComponent] });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('renders a toolbar with orientation metadata', () => {
        expect(root().getAttribute('role')).toBe('toolbar');
        expect(root().getAttribute('aria-orientation')).toBe('horizontal');
        expect(root().getAttribute('data-orientation')).toBe('horizontal');
    });

    it('marks buttons with orientation and a separator with role', () => {
        expect(buttons()[0].getAttribute('data-orientation')).toBe('horizontal');
        expect(buttons()[0].getAttribute('type')).toBe('button');
        const separator = fixture.debugElement.query(By.css('[rdxToolbarSeparator]')).nativeElement as HTMLElement;
        expect(separator.getAttribute('role')).toBe('separator');
        expect(separator.getAttribute('data-orientation')).toBe('vertical');
    });

    it('uses the toolbar as the focus entry and keeps items out of the tab order', () => {
        expect(root().getAttribute('tabindex')).toBe('0');
        expect(buttons().every((b) => b.getAttribute('tabindex') === '-1')).toBe(true);
    });

    it('disables a single button (aria-disabled, data-disabled, focusable by default)', () => {
        component.boldDisabled.set(true);
        fixture.detectChanges();

        const italic = buttons()[1];
        expect(italic.getAttribute('data-disabled')).toBe('');
        expect(italic.getAttribute('aria-disabled')).toBe('true');
        // focusableWhenDisabled is true by default → no native disabled attribute.
        expect(italic.hasAttribute('disabled')).toBe(false);
    });

    it('propagates disabled from the group to its items', () => {
        component.groupDisabled.set(true);
        fixture.detectChanges();

        const group = fixture.debugElement.query(By.css('[rdxToolbarGroup]')).nativeElement as HTMLElement;
        expect(group.getAttribute('data-disabled')).toBe('');
        expect(buttons()[0].getAttribute('data-disabled')).toBe('');
        // A button outside the group stays enabled.
        expect(buttons()[2].getAttribute('data-disabled')).toBeNull();
    });

    it('propagates disabled from the root to all items', () => {
        component.rootDisabled.set(true);
        fixture.detectChanges();

        expect(root().getAttribute('data-disabled')).toBe('');
        expect(buttons().every((b) => b.getAttribute('data-disabled') === '')).toBe(true);
    });

    it('updates orientation reactively', () => {
        component.orientation.set('vertical');
        fixture.detectChanges();
        expect(root().getAttribute('aria-orientation')).toBe('vertical');
        expect(buttons()[0].getAttribute('data-orientation')).toBe('vertical');
    });

    it('moves focus with arrow keys (roving)', () => {
        const items = buttons();
        items[0].focus();
        items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        fixture.detectChanges();
        // The roving group focuses the next item asynchronously (microtask).
        return Promise.resolve().then(() => {
            expect(document.activeElement).toBe(items[1]);
        });
    });
});

@Component({
    imports: [RdxToolbarRoot, RdxToolbarButton, RdxToolbarInput],
    template: `
        <div rdxToolbarRoot aria-label="Toolbar">
            <button rdxToolbarButton>Before</button>
            <input rdxToolbarInput defaultValue="abc" />
            <button rdxToolbarButton>After</button>
        </div>
    `
})
class InputHostComponent {}

describe('Toolbar input (composite caret)', () => {
    let fixture: ComponentFixture<InputHostComponent>;
    let input: HTMLInputElement;
    let before: HTMLButtonElement;
    let after: HTMLButtonElement;

    const arrow = (key: 'ArrowLeft' | 'ArrowRight' | 'Home') =>
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [InputHostComponent] });
        fixture = TestBed.createComponent(InputHostComponent);
        fixture.detectChanges();
        const inputs = fixture.debugElement.queryAll(By.css('input'));
        input = inputs[0].nativeElement;
        const btns = fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement);
        [before, after] = btns;
    });

    it('applies defaultValue', () => {
        expect(input.value).toBe('abc');
    });

    it('keeps focus in the input while the caret can still move', async () => {
        input.focus();
        input.setSelectionRange(1, 1);
        arrow('ArrowLeft');
        await Promise.resolve();
        expect(document.activeElement).toBe(input);
    });

    it('moves to the previous item when the caret is at the start', async () => {
        input.focus();
        input.setSelectionRange(0, 0);
        arrow('ArrowLeft');
        await Promise.resolve();
        expect(document.activeElement).toBe(before);
    });

    it('moves to the next item when the caret is at the end', async () => {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        arrow('ArrowRight');
        await Promise.resolve();
        expect(document.activeElement).toBe(after);
    });

    it('keeps Home/End inside the input', async () => {
        input.focus();
        input.setSelectionRange(2, 2);
        arrow('Home');
        await Promise.resolve();
        expect(document.activeElement).toBe(input);
    });
});
