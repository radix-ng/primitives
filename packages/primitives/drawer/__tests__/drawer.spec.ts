import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    createRdxDrawerHandle,
    drawerImports,
    RdxDrawerBackdrop,
    RdxDrawerClose,
    RdxDrawerContent,
    RdxDrawerDescription,
    RdxDrawerIndentBackground,
    RdxDrawerPopup,
    RdxDrawerPortal,
    RdxDrawerPortalPresence,
    RdxDrawerProvider,
    RdxDrawerProviderDirective,
    RdxDrawerRoot,
    RdxDrawerSnapPoint,
    RdxDrawerSwipeArea,
    RdxDrawerTitle,
    RdxDrawerTrigger
} from '@radix-ng/primitives/drawer';
import { axe } from 'jest-axe';

@Component({
    imports: [
        RdxDrawerRoot,
        RdxDrawerTrigger,
        RdxDrawerSwipeArea,
        RdxDrawerPortal,
        RdxDrawerPortalPresence,
        RdxDrawerBackdrop,
        RdxDrawerPopup,
        RdxDrawerContent,
        RdxDrawerTitle,
        RdxDrawerDescription,
        RdxDrawerClose
    ],
    template: `
        <div
            [(open)]="open"
            [modal]="modal"
            [swipeDirection]="swipeDirection"
            (onOpenChange)="changes.push($event.reason)"
            rdxDrawerRoot
        >
            <button rdxDrawerTrigger>Open</button>
            <div rdxDrawerSwipeArea></div>

            <ng-template rdxDrawerPortalPresence>
                <div rdxDrawerPortal>
                    <div rdxDrawerBackdrop></div>
                    <div rdxDrawerPopup>
                        <h2 rdxDrawerTitle>Title</h2>
                        <p rdxDrawerDescription>Description</p>
                        <div rdxDrawerContent>Body</div>
                        <button rdxDrawerClose>Close</button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
class TestHostComponent {
    open = false;
    modal: boolean | 'trap-focus' = true;
    swipeDirection: 'up' | 'down' | 'left' | 'right' = 'down';
    readonly changes: string[] = [];
}

@Component({
    imports: [RdxDrawerTrigger, RdxDrawerRoot, RdxDrawerPortal, RdxDrawerPortalPresence, RdxDrawerPopup],
    template: `
        <button id="detached" [handle]="handle" rdxDrawerTrigger>Open</button>
        <div [handle]="handle" rdxDrawerRoot>
            <ng-template rdxDrawerPortalPresence>
                <div rdxDrawerPortal>
                    <div rdxDrawerPopup>Popup</div>
                </div>
            </ng-template>
        </div>
    `
})
class DetachedHostComponent {
    readonly handle = createRdxDrawerHandle();
}

@Component({
    imports: [RdxDrawerRoot, RdxDrawerTrigger, RdxDrawerPortal, RdxDrawerPortalPresence, RdxDrawerPopup],
    template: `
        <div
            [(open)]="open"
            [(snapPoint)]="snapPoint"
            [snapPoints]="snapPoints"
            [defaultSnapPoint]="defaultSnapPoint"
            (onSnapPointChange)="changed.push($event)"
            rdxDrawerRoot
        >
            <button rdxDrawerTrigger>Open</button>
            <ng-template rdxDrawerPortalPresence>
                <div rdxDrawerPortal>
                    <div rdxDrawerPopup>Body</div>
                </div>
            </ng-template>
        </div>
    `
})
class SnapHostComponent {
    open = false;
    snapPoints: RdxDrawerSnapPoint[] = ['160px', 0.5, 1];
    defaultSnapPoint: RdxDrawerSnapPoint | undefined = undefined;
    snapPoint: RdxDrawerSnapPoint | null = null;
    readonly changed: RdxDrawerSnapPoint[] = [];
}

@Component({
    imports: [
        RdxDrawerProviderDirective,
        RdxDrawerIndentBackground,
        RdxDrawerRoot,
        RdxDrawerPortal,
        RdxDrawerPortalPresence,
        RdxDrawerPopup
    ],
    template: `
        <div rdxDrawerProvider>
            <div id="indent" rdxDrawerIndentBackground></div>

            <div [(open)]="outer" rdxDrawerRoot>
                <ng-template rdxDrawerPortalPresence>
                    <div rdxDrawerPortal>
                        <div data-testid="outer" rdxDrawerPopup>
                            <div [(open)]="inner" rdxDrawerRoot>
                                <ng-template rdxDrawerPortalPresence>
                                    <div rdxDrawerPortal>
                                        <div data-testid="inner" rdxDrawerPopup>
                                            <div [(open)]="deep" rdxDrawerRoot>
                                                <ng-template rdxDrawerPortalPresence>
                                                    <div rdxDrawerPortal>
                                                        <div data-testid="deep" rdxDrawerPopup>Deep</div>
                                                    </div>
                                                </ng-template>
                                            </div>
                                        </div>
                                    </div>
                                </ng-template>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
class NestedHostComponent {
    outer = false;
    inner = false;
    deep = false;
}

function popup(): HTMLElement | null {
    return document.body.querySelector('[rdxDrawerPopup]');
}

function pointer(type: string, props: { clientX?: number; clientY?: number }): MouseEvent {
    const event = new MouseEvent(type, { bubbles: true, button: 0, ...props });
    Object.defineProperty(event, 'isPrimary', { value: true });
    Object.defineProperty(event, 'pointerId', { value: 1 });
    return event;
}

describe('Drawer', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let trigger: HTMLButtonElement;

    beforeEach(() => {
        document.body.style.overflow = '';
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxDrawerTrigger]');
    });

    afterEach(() => {
        fixture.destroy();
        document.body.style.overflow = '';
    });

    it('exports parts via drawerImports', () => {
        expect(drawerImports).toContain(RdxDrawerRoot);
        expect(drawerImports).toContain(RdxDrawerPopup);
        expect(drawerImports).toContain(RdxDrawerSwipeArea);
    });

    it('opens from the trigger as a modal dialog by default', () => {
        trigger.click();
        fixture.detectChanges();

        const drawer = popup()!;
        const title: HTMLElement = document.body.querySelector('[rdxDrawerTitle]')!;

        expect(fixture.componentInstance.open).toBe(true);
        expect(drawer.getAttribute('role')).toBe('dialog');
        expect(drawer.getAttribute('aria-modal')).toBe('true');
        expect(drawer.getAttribute('aria-labelledby')).toBe(title.id);
        expect(drawer.getAttribute('data-swipe-direction')).toBe('down');
    });

    it('reflects the swipeDirection on the popup', () => {
        fixture.componentInstance.swipeDirection = 'right';
        fixture.componentInstance.open = true;
        fixture.detectChanges();

        expect(popup()!.getAttribute('data-swipe-direction')).toBe('right');
    });

    it('locks body scroll while open when modal', () => {
        trigger.click();
        fixture.detectChanges();
        expect(document.body.style.overflow).toBe('hidden');

        (document.body.querySelector('[rdxDrawerClose]') as HTMLButtonElement).click();
        fixture.detectChanges();
        expect(document.body.style.overflow).toBe('');
    });

    it('does not lock scroll and drops aria-modal when made non-modal', () => {
        fixture.componentInstance.modal = false;
        fixture.componentInstance.open = true;
        fixture.detectChanges();

        expect(document.body.style.overflow).toBe('');
        expect(popup()!.getAttribute('aria-modal')).toBeNull();
    });

    it('closes on Escape', async () => {
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
        expect(fixture.componentInstance.changes.at(-1)).toBe('escape-key');
    });

    it('does not start a gesture for a tap (clicks inside the drawer keep working)', () => {
        fixture.componentInstance.open = true;
        fixture.detectChanges();

        const drawer = popup()!;
        // Press and release without crossing the drag threshold: no gesture, no data-swiping.
        drawer.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
        expect(drawer.getAttribute('data-swiping')).toBeNull();

        window.dispatchEvent(pointer('pointerup', { clientX: 0, clientY: 1 }));
        fixture.detectChanges();

        expect(drawer.getAttribute('data-swiping')).toBeNull();
        expect(fixture.componentInstance.open).toBe(true);
    });

    it('dismisses on a swipe past the threshold and reports reason "swipe"', () => {
        fixture.componentInstance.open = true;
        fixture.detectChanges();

        const drawer = popup()!;
        drawer.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
        // The gesture only begins once the pointer crosses the drag threshold.
        expect(drawer.getAttribute('data-swiping')).toBeNull();

        window.dispatchEvent(pointer('pointermove', { clientX: 0, clientY: 400 }));
        expect(drawer.getAttribute('data-swiping')).toBe('');

        window.dispatchEvent(pointer('pointerup', { clientX: 0, clientY: 400 }));
        fixture.detectChanges();

        expect(fixture.componentInstance.open).toBe(false);
        expect(fixture.componentInstance.changes.at(-1)).toBe('swipe');
    });

    it('snaps back without closing when the swipe is cancelled mid-drag', () => {
        fixture.componentInstance.open = true;
        fixture.detectChanges();

        const drawer = popup()!;
        drawer.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
        window.dispatchEvent(pointer('pointermove', { clientX: 0, clientY: 60 }));
        expect(drawer.getAttribute('data-swiping')).toBe('');

        window.dispatchEvent(pointer('pointercancel', { clientX: 0, clientY: 60 }));
        fixture.detectChanges();

        expect(drawer.getAttribute('data-swiping')).toBeNull();
        expect(fixture.componentInstance.open).toBe(true);
    });

    it('controls a drawer from a detached trigger handle', () => {
        const detachedFixture = TestBed.createComponent(DetachedHostComponent);
        detachedFixture.detectChanges();

        const detached: HTMLButtonElement = detachedFixture.nativeElement.querySelector('#detached');
        detached.click();
        detachedFixture.detectChanges();

        expect(detachedFixture.componentInstance.handle.isOpen()).toBe(true);
        expect(document.body.querySelector('[rdxDrawerPopup]')).not.toBeNull();
        detachedFixture.destroy();
    });

    it('has no accessibility violations when open', async () => {
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(await axe(popup()!)).toHaveNoViolations();
    });

    describe('snap points', () => {
        let snapFixture: ComponentFixture<SnapHostComponent>;

        beforeEach(() => {
            snapFixture = TestBed.createComponent(SnapHostComponent);
            snapFixture.detectChanges();
        });

        afterEach(() => snapFixture.destroy());

        it('opens at the most open snap point by default', () => {
            snapFixture.componentInstance.open = true;
            snapFixture.detectChanges();

            expect(snapFixture.componentInstance.snapPoint).toBe(1);
        });

        it('opens at defaultSnapPoint when provided', () => {
            snapFixture.componentInstance.defaultSnapPoint = 0.5;
            snapFixture.componentInstance.open = true;
            snapFixture.detectChanges();

            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);
        });

        it('keeps a controlled snap point across close (does not clobber the binding)', () => {
            snapFixture.componentInstance.snapPoint = 0.5;
            snapFixture.componentInstance.open = true;
            snapFixture.detectChanges();
            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);

            snapFixture.componentInstance.open = false;
            snapFixture.detectChanges();

            // The active snap point survives a close/reopen cycle instead of being reset to null.
            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);

            snapFixture.componentInstance.open = true;
            snapFixture.detectChanges();
            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);
        });

        it('honors a controlled snap point without overriding it on open', () => {
            snapFixture.componentInstance.snapPoint = 0.5;
            snapFixture.componentInstance.open = true;
            snapFixture.detectChanges();

            expect(snapFixture.componentInstance.snapPoint).toBe(0.5);
        });
    });
});

describe('RdxDrawerProvider', () => {
    it('tracks open count, active state, and the frontmost height', () => {
        const provider = new RdxDrawerProvider();

        expect(provider.active()).toBe(false);
        expect(provider.frontmostHeight()).toBe(0);

        const releaseA = provider.register({ id: 'a', height: signal(100) });
        const releaseB = provider.register({ id: 'b', height: signal(220) });

        expect(provider.count()).toBe(2);
        expect(provider.active()).toBe(true);
        expect(provider.frontmostHeight()).toBe(220);

        releaseB();
        expect(provider.frontmostHeight()).toBe(100);

        releaseA();
        expect(provider.active()).toBe(false);
    });
});

describe('Drawer nesting & provider', () => {
    let fixture: ComponentFixture<NestedHostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [NestedHostComponent] });
        fixture = TestBed.createComponent(NestedHostComponent);
        fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    it('marks the indented background active while a drawer is open', () => {
        const indent = fixture.nativeElement.querySelector('#indent') as HTMLElement;
        expect(indent.getAttribute('data-active')).toBeNull();

        fixture.componentInstance.outer = true;
        fixture.detectChanges();

        expect(indent.getAttribute('data-active')).toBe('');
    });

    it('flags the parent popup when a nested drawer opens', () => {
        fixture.componentInstance.outer = true;
        fixture.detectChanges();

        const outer = document.body.querySelector('[data-testid="outer"]') as HTMLElement;
        expect(outer.getAttribute('data-nested-drawer-open')).toBeNull();

        fixture.componentInstance.inner = true;
        fixture.detectChanges();

        expect(outer.getAttribute('data-nested-drawer-open')).toBe('');
    });

    it('stacks three levels deep with each parent flagged', () => {
        fixture.componentInstance.outer = true;
        fixture.componentInstance.inner = true;
        fixture.componentInstance.deep = true;
        fixture.detectChanges();

        const outer = document.body.querySelector('[data-testid="outer"]') as HTMLElement;
        const inner = document.body.querySelector('[data-testid="inner"]') as HTMLElement;
        const deep = document.body.querySelector('[data-testid="deep"]') as HTMLElement;

        // All three popups are mounted simultaneously (stacked, not replaced).
        expect(outer).not.toBeNull();
        expect(inner).not.toBeNull();
        expect(deep).not.toBeNull();

        // Each parent reports an open nested drawer; the frontmost does not.
        expect(outer.getAttribute('data-nested-drawer-open')).toBe('');
        expect(inner.getAttribute('data-nested-drawer-open')).toBe('');
        expect(deep.getAttribute('data-nested-drawer-open')).toBeNull();
    });
});
