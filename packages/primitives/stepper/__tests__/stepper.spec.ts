import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { RdxStepperItemDirective } from '../src/stepper-item.directive';
import { RdxStepperRootDirective, RdxStepperValueChangeEvent } from '../src/stepper-root.directive';
import { RdxStepperTriggerDirective } from '../src/stepper-trigger.directive';

@Component({
    imports: [RdxStepperRootDirective, RdxStepperItemDirective, RdxStepperTriggerDirective],
    template: `
        <div [(value)]="value" (onValueChange)="onValueChange($event)" rdxStepperRoot>
            <div [step]="1" rdxStepperItem>
                <button rdxStepperTrigger>One</button>
            </div>
            <div [step]="2" rdxStepperItem>
                <button rdxStepperTrigger>Two</button>
            </div>
        </div>
    `
})
class StepperHost {
    value = 1;
    onValueChange = vi.fn<(change: RdxStepperValueChangeEvent) => void>();
}

describe('RdxStepper', () => {
    let fixture: ComponentFixture<StepperHost>;
    let host: StepperHost;
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [StepperHost] });
        fixture = TestBed.createComponent(StepperHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
        buttons = fixture.debugElement.queryAll(By.css('button')).map((d) => d.nativeElement);
    });

    it('emits a cancelable value change event before selecting a step', () => {
        buttons[1].dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
        fixture.detectChanges();

        expect(host.value).toBe(2);
        expect(host.onValueChange).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 2,
                eventDetails: expect.objectContaining({ reason: 'trigger-press', trigger: buttons[1] })
            })
        );
    });

    it('allows canceling value changes before state updates', () => {
        host.onValueChange.mockImplementationOnce((change) => change.eventDetails.cancel());

        buttons[1].dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
        fixture.detectChanges();

        expect(host.value).toBe(1);
        expect(buttons[0].closest('[rdxStepperItem]')?.getAttribute('data-state')).toBe('active');
        expect(buttons[1].closest('[rdxStepperItem]')?.getAttribute('data-state')).toBe('inactive');
    });
});
