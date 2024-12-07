import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxRovingFocusGroupDirective } from '@radix-ng/primitives/roving-focus';

@Component({
    selector: 'test-host',
    standalone: true,
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

    it('should handle `onItemFocus` and update currentTabStopId', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const directiveInstance = fixture.debugElement
            .query(By.directive(RdxRovingFocusGroupDirective))
            .injector.get(RdxRovingFocusGroupDirective);

        directiveInstance.onItemFocus('item1');
        expect(directiveInstance.currentTabStopId()).toBe('item1');

        directiveInstance.onItemFocus('item2');
        expect(directiveInstance.currentTabStopId()).toBe('item2');
    });

    it('should emit currentTabStopIdChange on item focus', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const directiveInstance = fixture.debugElement
            .query(By.directive(RdxRovingFocusGroupDirective))
            .injector.get(RdxRovingFocusGroupDirective);

        const spy = jest.spyOn(directiveInstance.currentTabStopIdChange, 'emit');

        directiveInstance.onItemFocus('item1');
        expect(spy).toHaveBeenCalledWith('item1');
    });

    it('should register and unregister focusable items correctly', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const directiveInstance = fixture.debugElement
            .query(By.directive(RdxRovingFocusGroupDirective))
            .injector.get(RdxRovingFocusGroupDirective);

        const item = document.createElement('div');
        directiveInstance.registerItem(item);
        expect(directiveInstance.focusableItems()).toContain(item);

        directiveInstance.unregisterItem(item);
        expect(directiveInstance.focusableItems()).not.toContain(item);
    });

    it('should handle `onFocusableItemAdd` and `onFocusableItemRemove` correctly', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const directiveInstance = fixture.debugElement
            .query(By.directive(RdxRovingFocusGroupDirective))
            .injector.get(RdxRovingFocusGroupDirective);

        directiveInstance.onFocusableItemAdd();
        expect(directiveInstance.getFocusableItemsCount()).toBe(1);

        directiveInstance.onFocusableItemRemove();
        expect(directiveInstance.getFocusableItemsCount()).toBe(0);
    });

    it('should handle `handleMouseDown` and set `isClickFocus` indirectly', () => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const directiveInstance = fixture.debugElement
            .query(By.directive(RdxRovingFocusGroupDirective))
            .injector.get(RdxRovingFocusGroupDirective);

        directiveInstance.handleMouseDown();

        // Use the public behavior to infer the private state change
        // For example, call a method that uses isClickFocus.
        expect(directiveInstance['isClickFocus']()).toBe(true);
    });

    it('should reset `isClickFocus` on mouse up', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();

        const directiveInstance = fixture.debugElement
            .query(By.directive(RdxRovingFocusGroupDirective))
            .injector.get(RdxRovingFocusGroupDirective);

        directiveInstance.handleMouseDown();
        directiveInstance.handleMouseUp();

        tick();

        expect(directiveInstance['isClickFocus']()).toBe(false);
    }));
});
