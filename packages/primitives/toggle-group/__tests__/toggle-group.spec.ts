import { Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { resetRdxDevWarnings } from '@radix-ng/primitives/core';
import { RdxToggle, RdxTogglePressedChangeEvent } from '@radix-ng/primitives/toggle';
import { RdxToolbarGroup, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import { vi } from 'vitest';
import { RdxToggleGroup } from '../src/toggle-group';
import { RdxToggleGroupValueChangeEvent } from '../src/toggle-group-base';
import { RdxToggleGroupWithoutFocus } from '../src/toggle-group-without-focus';

@Component({
    imports: [RdxToggleGroup, RdxToggle],
    template: `
        <div
            [(value)]="value"
            [multiple]="multiple()"
            [disabled]="disabled()"
            [orientation]="orientation()"
            [dir]="dir()"
            [loopFocus]="loopFocus()"
            (onValueChange)="onGroupValueChange($event)"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button (onPressedChange)="onItemPressedChange($event)" rdxToggle value="left" aria-label="Left aligned">
                Left
            </button>
            <button rdxToggle value="center" aria-label="Center aligned">Center</button>
            <button rdxToggle value="right" aria-label="Right aligned">Right</button>
        </div>
    `
})
class ToggleGroupTestComponent {
    readonly value = signal<string[] | undefined>(['center']);
    readonly multiple = signal(false);
    readonly disabled = signal(false);
    readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
    readonly dir = signal<'ltr' | 'rtl'>('ltr');
    readonly loopFocus = signal(true);
    readonly itemPressedChanges: boolean[] = [];
    readonly groupValueChanges: string[][] = [];
    itemLastReason: string | undefined;
    groupLastReason: string | undefined;
    cancelNextItemChange = false;
    cancelNextGroupChange = false;

    onItemPressedChange(change: RdxTogglePressedChangeEvent): void {
        this.itemPressedChanges.push(change.pressed);
        this.itemLastReason = change.eventDetails.reason;
        if (this.cancelNextItemChange) {
            change.eventDetails.cancel();
            this.cancelNextItemChange = false;
        }
    }

    onGroupValueChange(change: RdxToggleGroupValueChangeEvent): void {
        this.groupValueChanges.push(change.value);
        this.groupLastReason = change.eventDetails.reason;
        if (this.cancelNextGroupChange) {
            change.eventDetails.cancel();
            this.cancelNextGroupChange = false;
        }
    }
}

describe('RdxToggleGroup', () => {
    let fixture: ComponentFixture<ToggleGroupTestComponent>;
    let component: ToggleGroupTestComponent;
    let group: HTMLElement;
    let items: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ToggleGroupTestComponent] });
        fixture = TestBed.createComponent(ToggleGroupTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        group = fixture.debugElement.query(By.css('[rdxToggleGroup]')).nativeElement;
        items = fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement);
    });

    it('exposes role, orientation and pressed state', () => {
        expect(group.getAttribute('role')).toBe('group');
        expect(group.getAttribute('data-orientation')).toBe('horizontal');
        expect(items[1].getAttribute('aria-pressed')).toBe('true');
        expect(items[1].getAttribute('data-pressed')).toBe('');
        expect(items[0].getAttribute('data-pressed')).toBeNull();
    });

    it('keeps the tab stop on the pressed item', () => {
        expect(items[0].getAttribute('tabindex')).toBe('-1');
        expect(items[1].getAttribute('tabindex')).toBe('0');
        expect(items[2].getAttribute('tabindex')).toBe('-1');

        component.value.set(['right']);
        fixture.detectChanges();

        expect(items[0].getAttribute('tabindex')).toBe('-1');
        expect(items[1].getAttribute('tabindex')).toBe('-1');
        expect(items[2].getAttribute('tabindex')).toBe('0');
    });

    it('changes the value on item click (single)', () => {
        items[0].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['left']);
        expect(items[0].getAttribute('data-pressed')).toBe('');
        expect(items[1].getAttribute('data-pressed')).toBeNull();
        expect(component.itemPressedChanges).toEqual([true]);
        expect(component.groupValueChanges).toEqual([['left']]);
        expect(component.itemLastReason).toBe('none');
        expect(component.groupLastReason).toBe('none');
    });

    it('lets an item-level pressed change cancel the group value change', () => {
        component.cancelNextItemChange = true;

        items[0].click();
        fixture.detectChanges();

        expect(component.value()).toEqual(['center']);
        expect(component.itemPressedChanges).toEqual([true]);
        expect(component.groupValueChanges).toEqual([]);
        expect(items[0].getAttribute('data-pressed')).toBeNull();
        expect(items[1].getAttribute('data-pressed')).toBe('');
    });

    it('lets a group-level value change cancel before committing state', () => {
        component.cancelNextGroupChange = true;

        items[0].click();
        fixture.detectChanges();

        expect(component.value()).toEqual(['center']);
        expect(component.itemPressedChanges).toEqual([true]);
        expect(component.groupValueChanges).toEqual([['left']]);
        expect(items[0].getAttribute('data-pressed')).toBeNull();
        expect(items[1].getAttribute('data-pressed')).toBe('');
    });

    it('reflects programmatic value changes', () => {
        component.value.set(['right']);
        fixture.detectChanges();
        expect(items[2].getAttribute('aria-pressed')).toBe('true');
    });

    it('supports multiple selection and exposes data-multiple', () => {
        component.multiple.set(true);
        component.value.set(['center']);
        fixture.detectChanges();
        expect(group.getAttribute('data-multiple')).toBe('');

        items[0].click();
        items[2].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['center', 'left', 'right']);
    });

    it('disables the whole group', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        expect(group.getAttribute('data-disabled')).toBe('');
        expect(items[0].getAttribute('data-disabled')).toBe('');

        items[0].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['center']);
    });

    it('exposes vertical orientation', () => {
        component.orientation.set('vertical');
        fixture.detectChanges();
        expect(group.getAttribute('data-orientation')).toBe('vertical');
    });

    it('moves focus with arrow keys according to orientation and direction', async () => {
        items[0].focus();
        items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await Promise.resolve();
        expect(document.activeElement).toBe(items[1]);

        items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await Promise.resolve();
        expect(document.activeElement).toBe(items[1]);

        component.orientation.set('vertical');
        fixture.detectChanges();
        items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await Promise.resolve();
        expect(document.activeElement).toBe(items[2]);

        component.orientation.set('horizontal');
        component.dir.set('rtl');
        fixture.detectChanges();
        items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await Promise.resolve();
        expect(document.activeElement).toBe(items[1]);
    });

    it('supports Home, End, and non-looping arrow navigation', async () => {
        items[1].focus();

        items[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        await Promise.resolve();
        expect(document.activeElement).toBe(items[2]);

        items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
        await Promise.resolve();
        expect(document.activeElement).toBe(items[0]);

        component.loopFocus.set(false);
        fixture.detectChanges();
        items[2].focus();
        items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await Promise.resolve();
        expect(document.activeElement).toBe(items[2]);
    });
});

@Component({
    imports: [RdxToggleGroup, RdxToggle],
    template: `
        <div [value]="['known']" rdxToggleGroup aria-label="Missing value">
            <button rdxToggle>Missing value</button>
        </div>
    `
})
class MissingValueToggleGroup {}

describe('RdxToggleGroup diagnostics', () => {
    beforeEach(() => {
        resetRdxDevWarnings();
    });

    it('warns when a grouped toggle omits value', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        try {
            TestBed.configureTestingModule({ imports: [MissingValueToggleGroup] });
            const fixture = TestBed.createComponent(MissingValueToggleGroup);
            fixture.detectChanges();

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('[rdx:toggle-group/missing-toggle-value]'));
        } finally {
            warn.mockRestore();
        }
    });
});

@Component({
    imports: [RdxToolbarRoot, RdxToolbarGroup, RdxToggleGroupWithoutFocus, RdxToggle],
    template: `
        <div [disabled]="toolbarDisabled()" rdxToolbarRoot aria-label="Toolbar">
            <div [disabled]="toolbarGroupDisabled()" rdxToolbarGroup>
                <div [(value)]="value" rdxToggleGroupWithoutFocus aria-label="Alignment">
                    <button rdxToggle value="left">Left</button>
                    <button rdxToggle value="right">Right</button>
                </div>
            </div>
        </div>
    `
})
class ToolbarToggleGroupHost {
    readonly value = signal<string[] | undefined>(['left']);
    readonly toolbarDisabled = signal(false);
    readonly toolbarGroupDisabled = signal(false);
}

describe('RdxToggleGroupWithoutFocus inside Toolbar', () => {
    let fixture: ComponentFixture<ToolbarToggleGroupHost>;
    let component: ToolbarToggleGroupHost;
    let group: HTMLElement;
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ToolbarToggleGroupHost] });
        fixture = TestBed.createComponent(ToolbarToggleGroupHost);
        component = fixture.componentInstance;
        fixture.detectChanges();
        group = fixture.debugElement.query(By.css('[rdxToggleGroupWithoutFocus]')).nativeElement;
        buttons = fixture.debugElement.queryAll(By.css('[rdxToggle]')).map((d) => d.nativeElement);
    });

    it('inherits disabled state from the toolbar root', () => {
        component.toolbarDisabled.set(true);
        fixture.detectChanges();

        expect(group.getAttribute('data-disabled')).toBe('');
        expect(buttons[1].getAttribute('data-disabled')).toBe('');
        buttons[1].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['left']);
    });

    it('inherits disabled state from the toolbar group', () => {
        component.toolbarGroupDisabled.set(true);
        fixture.detectChanges();

        expect(group.getAttribute('data-disabled')).toBe('');
        expect(buttons[1].getAttribute('data-disabled')).toBe('');
        buttons[1].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['left']);
    });

    it('shares toolbar composite focus', async () => {
        expect(buttons[0].getAttribute('tabindex')).toBe('0');
        expect(buttons[1].getAttribute('tabindex')).toBe('-1');

        buttons[0].focus();
        buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await Promise.resolve();
        fixture.detectChanges();

        expect(document.activeElement).toBe(buttons[1]);
        expect(buttons[0].getAttribute('tabindex')).toBe('-1');
        expect(buttons[1].getAttribute('tabindex')).toBe('0');
    });
});

@Component({
    imports: [RdxToggleGroup, RdxToggle, ReactiveFormsModule],
    template: `
        <form [formGroup]="form">
            <div rdxToggleGroup formControlName="alignment" aria-label="Text alignment">
                <button rdxToggle value="left">Left</button>
                <button rdxToggle value="center">Center</button>
                <button rdxToggle value="right">Right</button>
            </div>
        </form>
    `
})
class ReactiveFormToggleGroup {
    private readonly fb = inject(FormBuilder);
    form: FormGroup = this.fb.group({ alignment: [['center']] });
}

describe('RdxToggleGroup with ReactiveFormsModule', () => {
    let fixture: ComponentFixture<ReactiveFormToggleGroup>;
    let component: ReactiveFormToggleGroup;
    let items: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ReactiveFormToggleGroup] });
        fixture = TestBed.createComponent(ReactiveFormToggleGroup);
        component = fixture.componentInstance;
        fixture.detectChanges();
        items = fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement);
    });

    it('initializes pressed state from the form control', () => {
        expect(items[1].getAttribute('aria-pressed')).toBe('true');
    });

    it('updates the form control value on click', () => {
        items[0].click();
        fixture.detectChanges();
        expect(component.form.value.alignment).toEqual(['left']);
    });

    it('reflects programmatic form changes and disabling', () => {
        component.form.get('alignment')?.setValue(['right']);
        fixture.detectChanges();
        expect(items[2].getAttribute('aria-pressed')).toBe('true');

        component.form.get('alignment')?.disable();
        fixture.detectChanges();
        items[0].click();
        fixture.detectChanges();
        // Disabled group ignores interaction — the value is unchanged.
        expect(component.form.getRawValue().alignment).toEqual(['right']);
    });
});
