import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxVisuallyHiddenDirective, VisuallyHidden } from '../src/visually-hidden.directive';

@Component({
    imports: [RdxVisuallyHiddenDirective],
    template: `
        <span [feature]="feature" rdxVisuallyHidden>Screen reader text</span>
    `
})
class TestComponent {
    feature: VisuallyHidden = 'focusable';
}

describe('RdxVisuallyHiddenDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let span: DebugElement;
    let directive: RdxVisuallyHiddenDirective;

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            imports: [TestComponent]
        }).createComponent(TestComponent);

        component = fixture.componentInstance;
        span = fixture.debugElement.query(By.directive(RdxVisuallyHiddenDirective));
        directive = span.injector.get(RdxVisuallyHiddenDirective);
        fixture.detectChanges();
    });

    it('should apply the visually-hidden style recipe', () => {
        const style = span.nativeElement.style;

        expect(style.position).toBe('absolute');
        expect(style.width).toBe('1px');
        expect(style.height).toBe('1px');
        expect(style.padding).toBe('0px');
        expect(style.margin).toBe('-1px');
        expect(style.overflow).toBe('hidden');
        expect(style.whiteSpace).toBe('nowrap');
    });

    describe('feature = "focusable" (default)', () => {
        it('should keep the content accessible (no aria-hidden)', () => {
            // Regression: the default mode must NOT hide content from assistive tech.
            expect(span.nativeElement.getAttribute('aria-hidden')).toBeNull();
        });

        it('should not set tabindex, hidden or data-hidden', () => {
            expect(span.nativeElement.getAttribute('tabindex')).toBeNull();
            expect(span.nativeElement.hidden).toBe(false);
            expect(span.nativeElement.getAttribute('data-hidden')).toBeNull();
        });

        it('should keep the element displayed (inline-block)', () => {
            expect(span.nativeElement.style.display).toBe('inline-block');
        });
    });

    describe('feature = "fully-hidden"', () => {
        beforeEach(() => {
            component.feature = 'fully-hidden';
            fixture.detectChanges();
        });

        it('should hide the content from assistive tech', () => {
            expect(span.nativeElement.getAttribute('aria-hidden')).toBe('true');
        });

        it('should remove it from the tab order and mark it hidden', () => {
            expect(span.nativeElement.getAttribute('tabindex')).toBe('-1');
            expect(span.nativeElement.hidden).toBe(true);
            expect(span.nativeElement.getAttribute('data-hidden')).toBe('');
        });

        it('should set display to none', () => {
            expect(span.nativeElement.style.display).toBe('none');
        });
    });

    describe('setFeature() runtime override', () => {
        it('should update every binding, including display', () => {
            // Regression: display must react to setFeature(), not only to the input.
            directive.setFeature('fully-hidden');
            fixture.detectChanges();

            expect(span.nativeElement.style.display).toBe('none');
            expect(span.nativeElement.getAttribute('aria-hidden')).toBe('true');
            expect(span.nativeElement.getAttribute('tabindex')).toBe('-1');
            expect(span.nativeElement.hidden).toBe(true);

            directive.setFeature('focusable');
            fixture.detectChanges();

            expect(span.nativeElement.style.display).toBe('inline-block');
            expect(span.nativeElement.getAttribute('aria-hidden')).toBeNull();
            expect(span.nativeElement.getAttribute('tabindex')).toBeNull();
            expect(span.nativeElement.hidden).toBe(false);
        });
    });
});
