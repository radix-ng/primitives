import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxArrow } from '../src/arrow';

@Component({
    imports: [RdxArrow],
    template: `
        <rdx-arrow [width]="width" [height]="height" />
    `
})
class DefaultHost {
    width = 10;
    height = 5;
}

@Component({
    imports: [RdxArrow],
    template: `
        <rdx-arrow>
            <span class="custom">custom</span>
        </rdx-arrow>
    `
})
class ProjectedHost {}

describe('RdxArrow', () => {
    describe('default content', () => {
        let fixture: ComponentFixture<DefaultHost>;

        const svg = () => fixture.debugElement.query(By.css('svg'))?.nativeElement as SVGElement | undefined;

        beforeEach(() => {
            fixture = TestBed.createComponent(DefaultHost);
            fixture.detectChanges();
        });

        it('renders the default arrow svg', () => {
            expect(svg()).toBeTruthy();
            expect(svg()!.querySelector('polygon')?.getAttribute('points')).toBe('0,0 30,0 15,10');
        });

        it('applies width and height as inline size', () => {
            expect((svg() as unknown as HTMLElement).style.width).toBe('10px');
            expect((svg() as unknown as HTMLElement).style.height).toBe('5px');

            fixture.componentInstance.width = 20;
            fixture.componentInstance.height = 8;
            fixture.detectChanges();

            expect((svg() as unknown as HTMLElement).style.width).toBe('20px');
            expect((svg() as unknown as HTMLElement).style.height).toBe('8px');
        });

        it('is hidden from assistive technology and themeable via currentColor', () => {
            expect(svg()!.getAttribute('aria-hidden')).toBe('true');
            expect(svg()!.getAttribute('focusable')).toBe('false');
            expect(svg()!.querySelector('polygon')?.getAttribute('fill')).toBe('currentColor');
        });
    });

    describe('projected content', () => {
        let fixture: ComponentFixture<ProjectedHost>;

        beforeEach(() => {
            fixture = TestBed.createComponent(ProjectedHost);
            fixture.detectChanges();
        });

        it('replaces the default svg with the projected content', () => {
            expect(fixture.debugElement.query(By.css('.custom'))).toBeTruthy();
            expect(fixture.debugElement.query(By.css('svg'))).toBeNull();
        });
    });
});
