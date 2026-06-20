import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxAspectRatioDirective } from '../src/aspect-ratio.directive';

@Component({
    template: `
        <div [ratio]="ratio()" rdxAspectRatio></div>
    `,
    imports: [RdxAspectRatioDirective]
})
class TestComponent {
    readonly ratio = signal(16 / 9);
}

describe('AspectRatioDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;
    let div: HTMLElement;

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            imports: [TestComponent]
        }).createComponent(TestComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
        div = fixture.nativeElement.querySelector('div');
    });

    it('sets the native aspect-ratio and full width', () => {
        expect(div.style.aspectRatio).toBe(String(16 / 9));
        expect(div.style.width).toBe('100%');
    });

    it('updates aspect-ratio when the ratio changes', () => {
        component.ratio.set(2);
        fixture.detectChanges();
        expect(div.style.aspectRatio).toBe('2');
    });

    it('defaults to a square (1) when ratio is 1', () => {
        component.ratio.set(1);
        fixture.detectChanges();
        expect(div.style.aspectRatio).toBe('1');
    });

    it('omits aspect-ratio when ratio is 0', () => {
        component.ratio.set(0);
        fixture.detectChanges();
        expect(div.style.aspectRatio).toBe('');
    });
});
