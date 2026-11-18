import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { Orientation } from '@radix-ng/primitives/separator';
import { vi } from 'vitest';
import { RdxStepperItemDirective } from '../src/stepper-item.directive';
import { RdxStepperRootDirective, RdxStepperValueChangeEvent } from '../src/stepper-root.directive';
import { RdxStepperSeparatorDirective } from '../src/stepper-separator.directive';
import { RdxStepperTriggerDirective } from '../src/stepper-trigger.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        RdxStepperRootDirective,
        RdxStepperItemDirective,
        RdxStepperTriggerDirective,
        RdxStepperSeparatorDirective
    ],
    template: `
        <div [(value)]="value" [orientation]="orientation()" (onValueChange)="onValueChange($event)" rdxStepperRoot>
            <div [step]="1" rdxStepperItem>
                <button rdxStepperTrigger>One</button>
                <hr [orientation]="separatorOrientation()" rdxStepperSeparator />
            </div>
            <div [step]="2" rdxStepperItem>
                <button rdxStepperTrigger>Two</button>
            </div>
        </div>
    `
})
class StepperHost {
    value = 1;
    readonly orientation = signal<Orientation>('horizontal');
    readonly separatorOrientation = signal<Orientation | undefined>('vertical');
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

    it('honors the separator orientation override and resumes following the root when cleared', () => {
        const separator: HTMLElement = fixture.nativeElement.querySelector('hr');
        const expectOrientation = (orientation: Orientation) => {
            expect(separator.getAttribute('role')).toBe('separator');
            expect(separator.getAttribute('aria-orientation')).toBe(orientation);
            expect(separator.getAttribute('data-orientation')).toBe(orientation);
        };

        expectOrientation('vertical');
        host.orientation.set('vertical');
        host.separatorOrientation.set('horizontal');
        fixture.detectChanges();
        expectOrientation('horizontal');

        host.separatorOrientation.set(undefined);
        fixture.detectChanges();
        expectOrientation('vertical');

        host.orientation.set('horizontal');
        fixture.detectChanges();
        expectOrientation('horizontal');
    });
});
