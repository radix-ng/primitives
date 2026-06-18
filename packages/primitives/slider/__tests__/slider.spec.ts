import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxSliderControl } from '../src/slider-control';
import { RdxSliderIndicator } from '../src/slider-indicator';
import { RdxSliderRoot, SliderValue } from '../src/slider-root';
import { RdxSliderThumb } from '../src/slider-thumb';
import { RdxSliderThumbInput } from '../src/slider-thumb-input';
import { RdxSliderTrack } from '../src/slider-track';
import {
    getPushedThumbValues,
    getSliderValue,
    resolveThumbCollision,
    roundValueToStep,
    valueToPercent
} from '../src/slider.utils';

describe('slider utils', () => {
    it('valueToPercent maps the range to 0–100', () => {
        expect(valueToPercent(0, 0, 100)).toBe(0);
        expect(valueToPercent(50, 0, 100)).toBe(50);
        expect(valueToPercent(5, 0, 10)).toBe(50);
    });

    it('roundValueToStep snaps to the step grid using min as origin', () => {
        expect(roundValueToStep(43, 5, 0)).toBe(45);
        expect(roundValueToStep(42, 5, 0)).toBe(40);
        expect(roundValueToStep(0.27, 0.1, 0)).toBe(0.3);
    });

    it('getSliderValue clamps a range thumb to its neighbours and re-sorts', () => {
        expect(getSliderValue(90, 0, 0, 100, true, [20, 80])).toEqual([80, 80]);
        expect(getSliderValue(50, 0, 0, 100, true, [20, 80])).toEqual([50, 80]);
        expect(getSliderValue(120, 0, 0, 100, false, [50])).toBe(100);
    });

    it('push behavior moves neighbours to keep the minimum distance', () => {
        const next = getPushedThumbValues({
            values: [20, 40],
            index: 0,
            nextValue: 50,
            min: 0,
            max: 100,
            step: 1,
            minStepsBetweenValues: 10
        });
        expect(next).toEqual([50, 60]);
    });

    it('resolveThumbCollision with "none" clamps between neighbours', () => {
        const result = resolveThumbCollision({
            behavior: 'none',
            values: [20, 80],
            pressedIndex: 0,
            nextValue: 90,
            min: 0,
            max: 100,
            step: 1,
            minStepsBetweenValues: 0
        });
        expect(result.value).toEqual([80, 80]);
        expect(result.didSwap).toBe(false);
    });
});

@Component({
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div [(value)]="value" [step]="step()" [disabled]="disabled()" (onValueChange)="onChange($event)" rdxSliderRoot>
            <div rdxSliderControl>
                <div rdxSliderTrack>
                    <div rdxSliderIndicator></div>
                    @for (v of thumbs(); track $index) {
                        <div [index]="$index" rdxSliderThumb>
                            <input rdxSliderThumbInput aria-label="value" />
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
class TestComponent {
    readonly value = signal<SliderValue>(40);
    readonly thumbs = signal([0]);
    readonly step = signal(5);
    readonly disabled = signal(false);

    onChange = vi.fn();
}

function press(el: HTMLElement, key: string, shiftKey = false): void {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
}

function touchEvent(type: string, x: number, y = 0, identifier = 1): TouchEvent {
    const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
    Object.defineProperty(event, 'changedTouches', {
        configurable: true,
        value: [{ identifier, clientX: x, clientY: y }]
    });
    return event;
}

describe('RdxSlider', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let root: HTMLElement;
    let inputs: HTMLInputElement[];

    function refresh(): void {
        inputs = fixture.debugElement.queryAll(By.css('[rdxSliderThumbInput]')).map((d) => d.nativeElement);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestComponent] });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxSliderRoot]')).nativeElement;
        refresh();
    });

    it('renders the group role and orientation', () => {
        expect(root.getAttribute('role')).toBe('group');
        expect(root.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('exposes the value through the native range input', () => {
        expect(inputs[0].value).toBe('40');
        expect(inputs[0].getAttribute('aria-valuenow')).toBe('40');
        expect(inputs[0].getAttribute('max')).toBe('100');
    });

    it('increments by the step on ArrowRight', () => {
        inputs[0].focus();
        press(inputs[0], 'ArrowRight');
        fixture.detectChanges();
        expect(component.value()).toBe(45);
        expect(component.onChange).toHaveBeenCalledWith(45);
    });

    it('uses the large step with Shift + Arrow', () => {
        press(inputs[0], 'ArrowUp', true);
        fixture.detectChanges();
        expect(component.value()).toBe(50);
    });

    it('jumps to min and max on Home / End', () => {
        press(inputs[0], 'End');
        fixture.detectChanges();
        expect(component.value()).toBe(100);
        press(inputs[0], 'Home');
        fixture.detectChanges();
        expect(component.value()).toBe(0);
    });

    it('does not change when disabled', () => {
        component.disabled.set(true);
        fixture.detectChanges();
        press(inputs[0], 'ArrowRight');
        fixture.detectChanges();
        expect(component.value()).toBe(40);
    });

    it('positions the indicator to the current percentage', () => {
        const indicator = fixture.debugElement.query(By.css('[rdxSliderIndicator]')).nativeElement as HTMLElement;
        expect(indicator.style.width).toBe('40%');
    });

    it('updates from touch drag on mobile', () => {
        const control = fixture.debugElement.query(By.css('[rdxSliderControl]')).nativeElement as HTMLElement;
        const thumb = fixture.debugElement.query(By.css('[rdxSliderThumb]')).nativeElement as HTMLElement;

        vi.spyOn(control, 'getBoundingClientRect').mockReturnValue({
            width: 100,
            height: 20,
            top: 0,
            right: 100,
            bottom: 20,
            left: 0,
            x: 0,
            y: 0,
            toJSON: () => ({})
        } as DOMRect);
        vi.spyOn(thumb, 'getBoundingClientRect').mockReturnValue({
            width: 20,
            height: 20,
            top: 0,
            right: 50,
            bottom: 20,
            left: 30,
            x: 30,
            y: 0,
            toJSON: () => ({})
        } as DOMRect);

        control.dispatchEvent(touchEvent('touchstart', 40));
        document.dispatchEvent(touchEvent('touchmove', 70));
        document.dispatchEvent(touchEvent('touchend', 70));
        fixture.detectChanges();

        expect(component.value()).toBe(70);
        expect(component.onChange).toHaveBeenLastCalledWith(70);
    });

    it('supports multiple thumbs and keeps them sorted', () => {
        component.value.set([20, 60]);
        component.thumbs.set([0, 1]);
        fixture.detectChanges();
        refresh();
        expect(inputs.map((i) => i.value)).toEqual(['20', '60']);

        press(inputs[1], 'Home');
        fixture.detectChanges();
        // second thumb cannot move below the first
        expect(component.value()).toEqual([20, 20]);
    });
});
