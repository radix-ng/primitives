import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { VisuallyHiddenDirective } from './visually-hidden.directive';

@Component({
    template: '<span rdxVisuallyHidden>Hidden content</span>'
})
class TestComponent {}

describe('VisuallyHiddenDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let span: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [VisuallyHiddenDirective]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        span = fixture.debugElement.query(By.css('span'));
        fixture.detectChanges();
    });

    it('should set the element style to visually hide the content', () => {
        const element = span.nativeElement as HTMLElement;
        const styles = element.style;

        expect(styles.position).toBe('absolute');
        expect(styles.border).toBe('0px');
        expect(styles.width).toBe('1px');
        expect(styles.height).toBe('1px');
        expect(styles.padding).toBe('0px');
        expect(styles.margin).toBe('-1px');
        expect(styles.overflow).toBe('hidden');
        expect(styles.clip).toBe('rect(0px, 0px, 0px, 0px)');
        expect(styles.whiteSpace).toBe('nowrap');
        expect(styles.wordWrap).toBe('normal');
        expect(styles.outline).toBe('none');
        expect(styles.appearance).toBe('none');
        expect(styles.left).toBe('0px');
    });
});
