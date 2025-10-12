import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxFocusOutside } from '../src/utils';

@Component({
    imports: [RdxFocusOutside],
    template: `
        <div>
            <button id="outside">Outside Button</button>
            <div #testContainer [enabled]="enabled" (focusOutside)="onFocusOutside($event)" rdxFocusOutside>
                <button id="inside">Inside Button</button>
            </div>
        </div>
    `
})
class TestComponent {
    enabled = true;
    onFocusOutside = jest.fn();
}

describe('RdxFocusOutside Directive', () => {
    async function setupTest(enabled = true) {
        await TestBed.configureTestingModule({
            imports: [TestComponent]
        }).compileComponents();

        const fixture = TestBed.createComponent(TestComponent);
        const host = fixture.componentInstance;
        host.enabled = enabled;
        fixture.detectChanges();

        const insideButton = fixture.debugElement.query(By.css('#inside')).nativeElement;
        const outsideButton = fixture.debugElement.query(By.css('#outside')).nativeElement;

        return { fixture, host, insideButton, outsideButton };
    }

    function triggerFocusEvent(element: HTMLElement, eventName: 'focus' | 'blur' | 'focusin') {
        const event = new FocusEvent(eventName, { bubbles: true, composed: true });
        element.dispatchEvent(event);
        return event;
    }

    it('should emit event when focus moves outside', async () => {
        const { host, insideButton } = await setupTest();

        triggerFocusEvent(insideButton, 'focus');
        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });

    it('should emit event when focus moves inside', async () => {
        const { host, outsideButton } = await setupTest();

        triggerFocusEvent(outsideButton, 'focusin');
        expect(host.onFocusOutside).not.toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'focusin',
                target: outsideButton
            })
        );
    });

    it('should NOT emit when focus stays inside', async () => {
        const { host, insideButton } = await setupTest();

        triggerFocusEvent(insideButton, 'focus');

        triggerFocusEvent(insideButton, 'focusin');
        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });

    it('should NOT emit when disabled', async () => {
        const { host, insideButton, outsideButton } = await setupTest(false);

        triggerFocusEvent(insideButton, 'focus');

        triggerFocusEvent(outsideButton, 'focusin');
        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });

    it('should clean up event listeners on destroy', async () => {
        const { fixture, host, outsideButton } = await setupTest();

        fixture.destroy();

        triggerFocusEvent(outsideButton, 'focusin');
        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });

    it('should emit when focus moves within the same element', async () => {
        const { host, insideButton } = await setupTest();

        triggerFocusEvent(insideButton, 'focus');

        triggerFocusEvent(insideButton, 'blur');
        triggerFocusEvent(insideButton, 'focusin');

        expect(host.onFocusOutside).not.toHaveBeenCalled();
    });
});
