import { TestBed } from '@angular/core/testing';

import { ElementRef } from '@angular/core';
import { RdxSwitchRootDirective } from '../src/switch-root.directive';

describe('RdxSwitchRootDirective', () => {
    let directive: RdxSwitchRootDirective;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RdxSwitchRootDirective,
                { provide: ElementRef, useValue: new ElementRef(document.createElement('button')) }]
        });

        directive = TestBed.inject(RdxSwitchRootDirective);
    });

    it('should initialize with default state', () => {
        expect(directive.checked()).toBe(false);
        expect(directive.required()).toBe(false);
        expect(directive.disabled()).toBe(false);
    });

    it('should toggle checked state and emit event', () => {
        const onCheckedChangeSpy = jest.spyOn(directive.onCheckedChange, 'emit');
        directive.toggle();

        expect(directive.checked()).toBe(true);
        expect(onCheckedChangeSpy).toHaveBeenCalledWith(true);

        directive.toggle();

        expect(directive.checked()).toBe(false);
        expect(onCheckedChangeSpy).toHaveBeenCalledWith(false);
    });

    it('should set disabled state using ControlValueAccessor', () => {
        directive.setDisabledState(true);
        expect(directive.disabledState()).toBe(true);

        directive.setDisabledState(false);
        expect(directive.disabledState()).toBe(false);
    });

    it('should emit correct values for controlled checked state', () => {
        const onCheckedChangeSpy = jest.spyOn(directive.onCheckedChange, 'emit');

        directive.checked.set(true);
        directive.toggle(); // Controlled state logic
        expect(directive.checked()).toBe(false);
        expect(onCheckedChangeSpy).toHaveBeenCalledWith(false);
    });
});
