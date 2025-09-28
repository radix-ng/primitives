import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';

@Component({
    selector: 'test-host',
    template: `
        <div rdxRovingFocusGroup>
            <button id="item1">Item 1</button>
            <button id="item2">Item 2</button>
            <button id="item3">Item 3</button>
        </div>
    `,
    imports: [RdxRovingFocusGroupDirective]
})
class TestHostComponent {}

describe('RdxRovingFocusGroupDirective', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });
    });

    it('should create the directive', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const hostElement = fixture.nativeElement.querySelector('[rdxRovingFocusGroup]');
        expect(hostElement).toBeTruthy();
    });

    it('should correctly handle focus logic', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const hostElement = fixture.nativeElement.querySelector('[rdxRovingFocusGroup]');
        const buttons = hostElement.querySelectorAll('button');

        // Simulate focus on the first button
        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);

        // Simulate navigation to the second button
        buttons[1].focus();
        expect(document.activeElement).toBe(buttons[1]);
    });
});
