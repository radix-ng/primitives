import { ChangeDetectionStrategy, Component, CSP_NONCE } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxScrollAreaContent } from '../src/scroll-area-content';
import { RdxScrollAreaCorner } from '../src/scroll-area-corner';
import { RdxScrollAreaRoot } from '../src/scroll-area-root';
import { RdxScrollAreaScrollbar } from '../src/scroll-area-scrollbar';
import { RdxScrollAreaThumb } from '../src/scroll-area-thumb';
import { RdxScrollAreaViewport } from '../src/scroll-area-viewport';
import { injectScrollbarHideStyles } from '../src/utils';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
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

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div rdxScrollAreaRoot>
            <div rdxScrollAreaViewport>
                <div rdxScrollAreaContent>content</div>
            </div>
        </div>
    `,
    imports: [RdxScrollAreaRoot, RdxScrollAreaViewport, RdxScrollAreaContent],
    providers: [{ provide: CSP_NONCE, useValue: 'test-scroll-area-nonce' }]
})
class CspNonceHostComponent {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <div disableStyleElements rdxScrollAreaRoot>
            <div rdxScrollAreaViewport>
                <div rdxScrollAreaContent>content</div>
            </div>
        </div>
    `,
    imports: [RdxScrollAreaRoot, RdxScrollAreaViewport, RdxScrollAreaContent]
})
class DisableStyleElementsHostComponent {}

describe('RdxScrollArea', () => {
    function setup() {
        const fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        return fixture;
    }

    beforeEach(() => {
        document.head.querySelectorAll('style[data-rdx-scroll-area]').forEach((style) => style.remove());
    });

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

    function setModality(root: HTMLElement, pointerType: 'touch' | 'mouse'): void {
        const event =
            typeof PointerEvent === 'undefined'
                ? new Event('pointerdown', { bubbles: true })
                : new PointerEvent('pointerdown', { bubbles: true, pointerType });
        Object.defineProperty(event, 'pointerType', { value: pointerType });
        root.dispatchEvent(event);
    }

    function fireScroll(viewport: HTMLElement, top: number): void {
        Object.defineProperty(viewport, 'scrollTop', { value: top, configurable: true });
        viewport.dispatchEvent(new Event('scroll'));
    }

    it('marks data-scrolling for a touch-modality scroll even without interaction events (iOS momentum)', () => {
        // WebKit consumes a touch that catches an in-flight momentum/rubber-band scroll without firing
        // any DOM events, so no user-interaction event precedes the scroll. Touch modality must still
        // attribute it to the user so the scrollbar shows (Base UI parity).
        const fixture = setup();
        const root = fixture.nativeElement.querySelector('[rdxScrollAreaRoot]') as HTMLElement;
        const viewport = fixture.nativeElement.querySelector('[rdxScrollAreaViewport]') as HTMLElement;

        setModality(root, 'touch');
        fireScroll(viewport, 50);
        fixture.detectChanges();

        expect(viewport.hasAttribute('data-scrolling')).toBe(true);
    });

    it('ignores a programmatic scroll in mouse modality (no data-scrolling)', () => {
        const fixture = setup();
        const root = fixture.nativeElement.querySelector('[rdxScrollAreaRoot]') as HTMLElement;
        const viewport = fixture.nativeElement.querySelector('[rdxScrollAreaViewport]') as HTMLElement;

        // Mouse modality with no preceding user-interaction event: the scroll is treated as programmatic.
        setModality(root, 'mouse');
        fireScroll(viewport, 50);
        fixture.detectChanges();

        expect(viewport.hasAttribute('data-scrolling')).toBe(false);
    });

    it('should apply the Angular CSP nonce to the injected scrollbar stylesheet', () => {
        const fixture = TestBed.createComponent(CspNonceHostComponent);
        fixture.detectChanges();

        const style = document.head.querySelector('style[data-rdx-scroll-area]') as HTMLStyleElement | null;
        expect(style).toBeTruthy();
        expect(style?.nonce).toBe('test-scroll-area-nonce');
    });

    it('should not inject the scrollbar stylesheet when style elements are disabled', () => {
        const fixture = TestBed.createComponent(DisableStyleElementsHostComponent);
        fixture.detectChanges();

        expect(document.head.querySelector('style[data-rdx-scroll-area]')).toBeNull();
    });

    it('should inject the scrollbar stylesheet once per document', () => {
        const firstDocument = document.implementation.createHTMLDocument('first');
        const secondDocument = document.implementation.createHTMLDocument('second');

        injectScrollbarHideStyles(firstDocument, 'first-nonce');
        injectScrollbarHideStyles(firstDocument, 'first-nonce');
        injectScrollbarHideStyles(secondDocument, 'second-nonce');

        const firstStyles = firstDocument.head.querySelectorAll('style[data-rdx-scroll-area]');
        const secondStyles = secondDocument.head.querySelectorAll('style[data-rdx-scroll-area]');

        expect(firstStyles).toHaveLength(1);
        expect((firstStyles[0] as HTMLStyleElement).nonce).toBe('first-nonce');
        expect(secondStyles).toHaveLength(1);
        expect((secondStyles[0] as HTMLStyleElement).nonce).toBe('second-nonce');
    });
});
