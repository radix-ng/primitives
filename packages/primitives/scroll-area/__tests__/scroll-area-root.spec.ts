import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxScrollAreaContent } from '../src/scroll-area-content';
import { RdxScrollAreaCorner } from '../src/scroll-area-corner';
import { RdxScrollAreaRoot } from '../src/scroll-area-root';
import { RdxScrollAreaScrollbar } from '../src/scroll-area-scrollbar';
import { RdxScrollAreaThumb } from '../src/scroll-area-thumb';
import { RdxScrollAreaViewport } from '../src/scroll-area-viewport';

@Component({
    template: `
        <div [overflowEdgeThreshold]="threshold" rdxScrollAreaRoot>
            <div rdxScrollAreaViewport style="width: 100px; height: 100px">
                <div rdxScrollAreaContent style="width: 400px; height: 400px">content</div>
            </div>
            <div rdxScrollAreaScrollbar orientation="vertical">
                <div rdxScrollAreaThumb></div>
            </div>
            <div rdxScrollAreaScrollbar orientation="horizontal">
                <div rdxScrollAreaThumb></div>
            </div>
            <div rdxScrollAreaCorner></div>
        </div>
    `,
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb,
        RdxScrollAreaCorner
    ]
})
class TestHostComponent {
    threshold = 0;
}

describe('RdxScrollArea', () => {
    function setup() {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        return fixture;
    }

    it('should create the root with presentation role and relative positioning', () => {
        const fixture = setup();
        const root = fixture.nativeElement.querySelector('[rdxScrollAreaRoot]') as HTMLElement;
        expect(root).toBeTruthy();
        expect(root.getAttribute('role')).toBe('presentation');
        expect(root.style.position).toBe('relative');
    });

    it('should render the viewport with overflow scroll', () => {
        const fixture = setup();
        const viewport = fixture.nativeElement.querySelector('[rdxScrollAreaViewport]') as HTMLElement;
        expect(viewport).toBeTruthy();
        expect(viewport.style.overflow).toBe('scroll');
        expect(viewport.getAttribute('role')).toBe('presentation');
    });

    it('should mark each scrollbar with its orientation', () => {
        const fixture = setup();
        const scrollbars = fixture.nativeElement.querySelectorAll('[rdxScrollAreaScrollbar]');
        const orientations = Array.from(scrollbars).map((el) => (el as HTMLElement).getAttribute('data-orientation'));
        expect(orientations).toContain('vertical');
        expect(orientations).toContain('horizontal');
    });

    it('should absolutely position the scrollbar and corner', () => {
        const fixture = setup();
        const scrollbar = fixture.nativeElement.querySelector('[rdxScrollAreaScrollbar]') as HTMLElement;
        const corner = fixture.nativeElement.querySelector('[rdxScrollAreaCorner]') as HTMLElement;
        expect(scrollbar.style.position).toBe('absolute');
        expect(corner.style.position).toBe('absolute');
    });

    it('should give the thumb the matching orientation attribute', () => {
        const fixture = setup();
        const thumb = fixture.nativeElement.querySelector('[rdxScrollAreaThumb]') as HTMLElement;
        expect(thumb.getAttribute('data-orientation')).toBe('vertical');
    });
});
