import {
    getPushedThumbValues,
    getSliderValue,
    resolveThumbCollision,
    roundValueToStep,
    valueToPercent
} from '../src/slider.utils';
import { RdxSliderControl } from '../src/slider-control';
import { RdxSliderIndicator } from '../src/slider-indicator';
import {
    RdxSliderRoot,
    RdxSliderThumbAlignment,
    RdxSliderValueChangeEvent,
    RdxSliderValueCommitEvent,
    SliderValue
} from '../src/slider-root';
import { RdxSliderThumb } from '../src/slider-thumb';
import { RdxSliderThumbInput } from '../src/slider-thumb-input';
import { RdxSliderTrack } from '../src/slider-track';
import { RdxSliderValue } from '../src/slider-value';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput,
        RdxSliderValue
    ],
    template: `
        <div
            rdxSliderRoot
            [step]="step()"
            [disabled]="disabled()"
            [name]="name()"
            [(value)]="value"
            (onValueChange)="onChange($event)"
        >
            <output rdxSliderValue></output>
            <div rdxSliderControl>
                <div rdxSliderTrack>
                    <div rdxSliderIndicator></div>
                    @for (v of thumbs(); track $index) {
                        <div rdxSliderThumb [index]="$index">
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
    readonly name = signal<string | undefined>(undefined);

    onChange = vi.fn<(change: RdxSliderValueChangeEvent) => void>();
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div
            rdxSliderRoot
            [thumbAlignment]="thumbAlignment()"
            [(value)]="value"
            (onValueChange)="onChange($event)"
            (onValueCommitted)="onCommit($event)"
        >
            <div rdxSliderControl>
                <div rdxSliderTrack>
                    <div rdxSliderIndicator></div>
                    <div rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
class EdgeComponent {
    readonly value = signal<SliderValue>(50);
    readonly thumbAlignment = signal<RdxSliderThumbAlignment>('edge');
    onChange = vi.fn<(change: RdxSliderValueChangeEvent) => void>();
    onCommit = vi.fn<(change: RdxSliderValueCommitEvent) => void>();
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div rdxSliderRoot [value]="value()">
            <div rdxSliderControl>
                <div rdxSliderTrack>
                    <div rdxSliderIndicator></div>
                    <div rdxSliderThumb [index]="1">
                        <input rdxSliderThumbInput aria-label="value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
class SingleExplicitIndexComponent {
    readonly value = signal<SliderValue>(40);
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

    it('ignores explicit thumb index for a single-value slider', () => {
        const singleFixture = TestBed.createComponent(SingleExplicitIndexComponent);
        singleFixture.detectChanges();
        const thumb = singleFixture.debugElement.query(By.css('[rdxSliderThumb]')).nativeElement as HTMLElement;
        const input = singleFixture.debugElement.query(By.css('[rdxSliderThumbInput]'))
            .nativeElement as HTMLInputElement;

        expect(thumb.getAttribute('data-index')).toBe('0');
        expect(input.value).toBe('40');
    });

    it('increments by the step on ArrowRight', () => {
        component.name.set('volume');
        fixture.detectChanges();
        inputs[0].focus();
        press(inputs[0], 'ArrowRight');
        fixture.detectChanges();
        const change = component.onChange.mock.lastCall?.[0];

        expect(component.value()).toBe(45);
        expect(component.onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 45,
                eventDetails: expect.objectContaining({ reason: 'keyboard', activeThumbIndex: 0 })
            })
        );
        expect((change?.eventDetails.event.target as { value: SliderValue; name: string | undefined }).value).toBe(45);
        expect((change?.eventDetails.event.target as { value: SliderValue; name: string | undefined }).name).toBe(
            'volume'
        );
    });

    it('allows canceling value changes before state updates', () => {
        component.onChange.mockImplementationOnce((change) => change.eventDetails.cancel());

        inputs[0].focus();
        press(inputs[0], 'ArrowRight');
        fixture.detectChanges();

        expect(component.value()).toBe(40);
        expect(inputs[0].value).toBe('40');
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
        expect(component.onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 70 }));
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

    it('associates value output with thumb inputs in DOM order', async () => {
        component.value.set([20, 60]);
        component.thumbs.set([0, 1]);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        refresh();

        const output = fixture.debugElement.query(By.css('[rdxSliderValue]')).nativeElement as HTMLOutputElement;

        expect(inputs.every((input) => input.id.startsWith('rdx-slider-thumb-input-'))).toBe(true);
        expect(output.getAttribute('for')).toBe(inputs.map((input) => input.id).join(' '));
    });

    it('emits commit events with Base UI-like event details', () => {
        inputs[0].focus();
        press(inputs[0], 'ArrowRight');
        fixture.detectChanges();

        const commits: RdxSliderValueCommitEvent[] = [];
        const rootDirective = fixture.debugElement.query(By.directive(RdxSliderRoot)).injector.get(RdxSliderRoot);
        rootDirective.onValueCommitted.subscribe((commit) => commits.push(commit));

        press(inputs[0], 'ArrowRight');
        fixture.detectChanges();

        expect(commits.at(-1)).toEqual(
            expect.objectContaining({
                value: 50,
                eventDetails: expect.objectContaining({ reason: 'keyboard' })
            })
        );
    });

    it('supports edge-aligned thumb and indicator positioning', async () => {
        const edgeFixture = TestBed.createComponent(EdgeComponent);
        edgeFixture.detectChanges();
        const control = edgeFixture.debugElement.query(By.css('[rdxSliderControl]')).nativeElement as HTMLElement;
        const thumb = edgeFixture.debugElement.query(By.css('[rdxSliderThumb]')).nativeElement as HTMLElement;
        const indicator = edgeFixture.debugElement.query(By.css('[rdxSliderIndicator]')).nativeElement as HTMLElement;

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
            right: 60,
            bottom: 20,
            left: 40,
            x: 40,
            y: 0,
            toJSON: () => ({})
        } as DOMRect);

        await edgeFixture.whenStable();
        edgeFixture.detectChanges();
        await new Promise<void>((resolve) => queueMicrotask(resolve));
        edgeFixture.detectChanges();

        expect(thumb.style.insetInlineStart).toBe('50%');
        expect(indicator.style.width).toBe('50%');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div rdxSliderRoot [invalid]="invalid()" [errors]="errors()" [dirty]="dirty()" [(value)]="value">
            <div rdxSliderControl>
                <div rdxSliderTrack>
                    <div rdxSliderIndicator></div>
                    <div rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
class SliderValidationComponent {
    readonly value = signal<SliderValue>(40);
    readonly invalid = signal(false);
    readonly dirty = signal(false);
    readonly errors = signal<{ kind: string; message?: string }[]>([]);
}

describe('RdxSlider validation state', () => {
    let fixture: ComponentFixture<SliderValidationComponent>;
    let host: SliderValidationComponent;
    let root: HTMLElement;
    let input: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SliderValidationComponent] });
        fixture = TestBed.createComponent(SliderValidationComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        root = fixture.debugElement.query(By.css('[rdxSliderRoot]')).nativeElement;
        input = fixture.debugElement.query(By.css('[rdxSliderThumbInput]')).nativeElement;
    });

    it('is valid by default', () => {
        expect(root.getAttribute('data-valid')).toBe('');
        expect(root.getAttribute('data-invalid')).toBeNull();
        expect(root.getAttribute('aria-invalid')).toBeNull();
    });

    it('reflects the invalid input on the root', () => {
        host.invalid.set(true);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('aria-invalid')).toBe('true');
    });

    it('is invalid when the errors list is non-empty', () => {
        host.errors.set([{ kind: 'required', message: 'Required.' }]);
        fixture.detectChanges();
        expect(root.getAttribute('data-invalid')).toBe('');
        expect(root.getAttribute('aria-invalid')).toBe('true');
    });

    it('marks dirty after a value change', () => {
        expect(root.getAttribute('data-dirty')).toBeNull();
        input.focus();
        press(input, 'ArrowRight');
        fixture.detectChanges();
        expect(root.getAttribute('data-dirty')).toBe('');
    });

    it('marks touched on focus-out', () => {
        expect(root.getAttribute('data-touched')).toBeNull();
        root.dispatchEvent(new FocusEvent('focusout'));
        fixture.detectChanges();
        expect(root.getAttribute('data-touched')).toBe('');
    });
});

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        FormField,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div rdxSliderRoot [formField]="amount">
            <div rdxSliderControl>
                <div rdxSliderTrack>
                    <div rdxSliderIndicator></div>
                    <div rdxSliderThumb>
                        <input rdxSliderThumbInput aria-label="value" />
                    </div>
                </div>
            </div>
        </div>
    `
})
class SliderSignalFormComponent {
    readonly model = signal<{ amount: number }>({ amount: 40 });
    readonly formTree = form(this.model);

    get amount() {
        return this.formTree.amount;
    }
}

describe('RdxSlider with Signal Forms', () => {
    let fixture: ComponentFixture<SliderSignalFormComponent>;
    let host: SliderSignalFormComponent;
    let input: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [SliderSignalFormComponent] });
        fixture = TestBed.createComponent(SliderSignalFormComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        input = fixture.debugElement.query(By.css('[rdxSliderThumbInput]')).nativeElement;
    });

    it('reflects the bound field value (FormValueControl)', () => {
        expect(input.value).toBe('40');
        host.model.update((value) => ({ ...value, amount: 60 }));
        fixture.detectChanges();
        expect(input.value).toBe('60');
    });

    it('updates the bound field on interaction', () => {
        input.focus();
        press(input, 'ArrowRight');
        fixture.detectChanges();
        expect(host.model().amount).toBe(41);
    });
});
