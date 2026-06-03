import { RdxPortal, RdxPortalContainer } from '../src/portal';
import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxPortal],
    template: `
        <div id="origin">
            <div id="portaled" rdxPortal [container]="container">content</div>
        </div>
    `
})
class PortalHostComponent {
    container?: RdxPortalContainer;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxPortal],
    template: `
        <div id="origin">
            @if (show) {
                <div id="portaled" rdxPortal>content</div>
            }
        </div>
    `
})
class TogglePortalHostComponent {
    show = true;
}

function portaledElement(): HTMLElement | null {
    return document.getElementById('portaled');
}

describe('RdxPortal', () => {
    let createdContainers: HTMLElement[] = [];

    function createContainer(): ElementRef<HTMLElement> {
        const element = document.createElement('div');
        document.body.appendChild(element);
        createdContainers.push(element);
        return new ElementRef(element);
    }

    afterEach(() => {
        createdContainers.forEach((element) => element.remove());
        createdContainers = [];
        portaledElement()?.remove();
    });

    describe('with a default container', () => {
        let fixture: ComponentFixture<PortalHostComponent>;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [PortalHostComponent] });
            fixture = TestBed.createComponent(PortalHostComponent);
        });

        it('moves the element to document.body', () => {
            fixture.detectChanges();

            expect(portaledElement()?.parentElement).toBe(document.body);
        });

        it('leaves a comment anchor at the original position', () => {
            fixture.detectChanges();

            const origin = fixture.nativeElement.querySelector('#origin') as HTMLElement;
            const hasAnchor = Array.from(origin.childNodes).some(
                (node) => node.nodeType === Node.COMMENT_NODE && node.textContent === 'rdx-portal'
            );

            expect(hasAnchor).toBe(true);
            expect(origin.contains(portaledElement())).toBe(false);
        });
    });

    describe('with a provided container', () => {
        let fixture: ComponentFixture<PortalHostComponent>;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [PortalHostComponent] });
            fixture = TestBed.createComponent(PortalHostComponent);
        });

        it('respects the container input on the first render', () => {
            const target = createContainer();
            fixture.componentInstance.container = target;

            fixture.detectChanges();

            expect(target.nativeElement.contains(portaledElement())).toBe(true);
        });

        it('accepts a native element as the container', () => {
            const target = createContainer();
            fixture.componentInstance.container = target.nativeElement;

            fixture.detectChanges();

            expect(target.nativeElement.contains(portaledElement())).toBe(true);
        });

        it('accepts a CSS selector as the container', () => {
            const target = createContainer();
            target.nativeElement.id = 'portal-target';
            fixture.componentInstance.container = '#portal-target';

            fixture.detectChanges();

            expect(target.nativeElement.contains(portaledElement())).toBe(true);
        });

        it('falls back to document.body when a selector matches nothing', () => {
            fixture.componentInstance.container = '#does-not-exist';

            fixture.detectChanges();

            expect(portaledElement()?.parentElement).toBe(document.body);
        });

        it('moves the element when the container input changes', () => {
            fixture.detectChanges();
            expect(portaledElement()?.parentElement).toBe(document.body);

            const target = createContainer();
            fixture.componentInstance.container = target;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(target.nativeElement.contains(portaledElement())).toBe(true);
        });

        it('moves the element when setContainer is called', () => {
            fixture.detectChanges();

            const portal = fixture.debugElement.query(By.directive(RdxPortal)).injector.get(RdxPortal);
            const target = createContainer();

            portal.setContainer(target);
            fixture.detectChanges();

            expect(target.nativeElement.contains(portaledElement())).toBe(true);
        });
    });

    describe('on destroy', () => {
        it('restores the element so it is cleaned up with its view (no DOM leak)', () => {
            TestBed.configureTestingModule({ imports: [TogglePortalHostComponent] });
            const fixture = TestBed.createComponent(TogglePortalHostComponent);
            fixture.detectChanges();

            expect(portaledElement()?.parentElement).toBe(document.body);

            fixture.componentInstance.show = false;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();

            expect(portaledElement()).toBeNull();
        });
    });
});
