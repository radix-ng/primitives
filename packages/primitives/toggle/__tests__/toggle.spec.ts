import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxToggleGroup } from '@radix-ng/primitives/toggle-group';
import { vi } from 'vitest';
import { RdxToggle, RdxTogglePressedChangeEvent } from '../src/toggle';

@Component({
    imports: [RdxToggle],
    template: `
        <button
            [(pressed)]="pressed"
            [disabled]="disabled()"
            [defaultPressed]="defaultPressed()"
            (onPressedChange)="onToggle($event)"
            rdxToggle
        >
            Toggle
        </button>
    `
})
class TestComponent {
    readonly pressed = signal<boolean | undefined>(undefined);
    readonly disabled = signal(false);
    readonly defaultPressed = signal(false);

    onToggle = vi.fn<(change: RdxTogglePressedChangeEvent) => void>();
}

describe('RdxToggle (standalone)', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let button: HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestComponent] });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        button = fixture.debugElement.query(By.css('button')).nativeElement;
        fixture.detectChanges();
    });

    it('renders an unpressed button by default', () => {
        expect(button.getAttribute('type')).toBe('button');
        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(button.getAttribute('data-pressed')).toBeNull();
    });

    it('reflects pressed via aria-pressed and data-pressed', () => {
        component.pressed.set(true);
        fixture.detectChanges();
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(button.getAttribute('data-pressed')).toBe('');
    });

    it('honors defaultPressed when uncontrolled', () => {
        component.defaultPressed.set(true);
        fixture.detectChanges();
        expect(button.getAttribute('data-pressed')).toBe('');
    });

    it('toggles pressed on click and emits onPressedChange', () => {
        button.click();
        fixture.detectChanges();
        expect(component.pressed()).toBe(true);
        expect(component.onToggle).toHaveBeenLastCalledWith(
            expect.objectContaining({
                pressed: true,
                eventDetails: expect.objectContaining({ reason: 'trigger-press', trigger: button })
            })
        );

        button.click();
        fixture.detectChanges();
        expect(component.pressed()).toBe(false);
        expect(component.onToggle).toHaveBeenLastCalledWith(expect.objectContaining({ pressed: false }));
    });

    it('allows canceling before pressed state updates', () => {
        component.onToggle.mockImplementationOnce((change) => change.eventDetails.cancel());

        button.click();
        fixture.detectChanges();

        expect(component.pressed()).toBeUndefined();
        expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('exposes and respects the disabled state', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        expect(button.getAttribute('data-disabled')).toBe('');
        expect(button.hasAttribute('disabled')).toBe(true);

        button.click();
        fixture.detectChanges();
        expect(component.pressed()).toBeUndefined();
        expect(component.onToggle).not.toHaveBeenCalled();
    });
});

@Component({
    imports: [RdxToggleGroup, RdxToggle],
    template: `
        <div [(value)]="value" [multiple]="multiple()" rdxToggleGroup aria-label="Text formatting">
            <button rdxToggle value="bold">Bold</button>
            <button rdxToggle value="italic">Italic</button>
            <button rdxToggle value="underline">Underline</button>
        </div>
    `
})
class GroupedComponent {
    readonly value = signal<string[] | undefined>(['bold']);
    readonly multiple = signal(false);
}

describe('RdxToggle (inside RdxToggleGroup)', () => {
    let fixture: ComponentFixture<GroupedComponent>;
    let component: GroupedComponent;
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [GroupedComponent] });
        fixture = TestBed.createComponent(GroupedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        buttons = fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement);
    });

    it('derives pressed state from the group value', () => {
        expect(buttons[0].getAttribute('data-pressed')).toBe('');
        expect(buttons[1].getAttribute('data-pressed')).toBeNull();
    });

    it('single mode replaces the pressed value', () => {
        buttons[1].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['italic']);
        expect(buttons[0].getAttribute('data-pressed')).toBeNull();
        expect(buttons[1].getAttribute('data-pressed')).toBe('');
    });

    it('single mode deselects when clicking the pressed item', () => {
        buttons[0].click();
        fixture.detectChanges();
        expect(component.value()).toEqual([]);
    });

    it('multiple mode accumulates values', () => {
        component.multiple.set(true);
        fixture.detectChanges();

        buttons[1].click();
        buttons[2].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['bold', 'italic', 'underline']);

        buttons[0].click();
        fixture.detectChanges();
        expect(component.value()).toEqual(['italic', 'underline']);
    });
});
