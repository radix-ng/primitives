import { ChangeDetectionStrategy, Component, Directive, ElementRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { type MockInstance, vi } from 'vitest';
import { RdxPortalPresence } from '../src/portal-presence';
import { RdxPortalContainer } from '../src/resolve-container';

// Wrapper mirroring how a real primitive applies the structural portal: a selectored
// `ng-template` directive composing RdxPortalPresence via hostDirectives.
@Directive({
    selector: 'ng-template[testPortal]',
    standalone: true,
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }]
})
class TestPortalWrapper {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-portal-host',
    standalone: true,
    imports: [TestPortalWrapper],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PortalHostComponent).present }))],
    template: `
        <div id="origin">
            <ng-template [container]="container()" testPortal>
                <div class="content" [attr.data-state]="present() ? 'open' : 'closed'">content</div>
            </ng-template>
        </div>
    `
})
class PortalHostComponent {
    readonly present = signal(false);
    readonly container = signal<RdxPortalContainer | undefined>(undefined);
}

// Wrapper opting into the shared `keepMounted` input (as a real `*rdxXxxPortal` does).
@Directive({
    selector: 'ng-template[testKeepMountedPortal]',
    standalone: true,
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['keepMounted'] }]
})
class TestKeepMountedPortalWrapper {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-keep-mounted-host',
    standalone: true,
    imports: [TestKeepMountedPortalWrapper],
    providers: [provideRdxPresenceContext(() => ({ present: inject(KeepMountedHostComponent).present }))],
    template: `
        <ng-template [keepMounted]="keepMounted()" testKeepMountedPortal>
            <div class="content" [attr.data-state]="present() ? 'open' : 'closed'">content</div>
        </ng-template>
    `
})
class KeepMountedHostComponent {
    readonly present = signal(false);
    readonly keepMounted = signal(false);
}

// Two sibling root nodes (dialog-shaped: backdrop + popup), each with its own exit animation hook.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-portal-multi-host',
    standalone: true,
    imports: [TestPortalWrapper],
    providers: [provideRdxPresenceContext(() => ({ present: inject(MultiRootHostComponent).present }))],
    template: `
        <ng-template testPortal>
            <div
                class="backdrop"
                [attr.data-state]="present() ? 'open' : 'closed'"
                [attr.data-exit]="backdropExit()"
            ></div>
            <div class="popup" [attr.data-state]="present() ? 'open' : 'closed'" [attr.data-exit]="popupExit()"></div>
        </ng-template>
    `
})
class MultiRootHostComponent {
    readonly present = signal(true);
    readonly backdropExit = signal<string | null>(null);
    readonly popupExit = signal<string | null>(null);
}

/**
 * Mock `getComputedStyle` so jsdom (which runs no CSS) reports an exit `@keyframes` only when an
 * element is in its closed state. `data-exit` overrides the animation name; `data-anim-always` makes
 * a node animate identically open and closed (used to assert the "different animation" heuristic).
 */
function mockComputedStyle(): MockInstance {
    return vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
        const always = el.getAttribute?.('data-anim-always');
        const closed = el.getAttribute?.('data-state') === 'closed';
        const exitName = el.getAttribute?.('data-exit') || 'exit';
        const animationName = always ?? (closed ? exitName : 'none');
        return { animationName, display: 'block' } as unknown as CSSStyleDeclaration;
    });
}

function endAnimation(node: HTMLElement, animationName = 'exit'): void {
    const event = new Event('animationend') as AnimationEvent & { animationName: string };
    event.animationName = animationName;
    node.dispatchEvent(event);
}

describe('RdxPortalPresence — portaling', () => {
    let fixture: ComponentFixture<PortalHostComponent>;
    let host: PortalHostComponent;
    let gcsSpy: MockInstance;

    const bodyContent = () => document.body.querySelector(':scope > .content') as HTMLElement | null;
    const originContent = () => fixture.nativeElement.querySelector('#origin .content') as HTMLElement | null;

    beforeEach(() => {
        gcsSpy = mockComputedStyle();
        fixture = TestBed.createComponent(PortalHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        gcsSpy.mockRestore();
    });

    it('does not render while present() is false', () => {
        expect(bodyContent()).toBeNull();
        expect(originContent()).toBeNull();
    });

    it('mounts into document.body by default and adds no wrapper element', () => {
        host.present.set(true);
        fixture.detectChanges();

        const content = bodyContent();
        expect(content).not.toBeNull();
        // direct child of body — no portal wrapper div around it
        expect(content!.parentElement).toBe(document.body);
        // and it left its original position
        expect(originContent()).toBeNull();
    });

    it('mounts into an ElementRef container', () => {
        const target = document.createElement('div');
        target.id = 'custom-er';
        document.body.appendChild(target);
        host.container.set(new ElementRef(target));
        host.present.set(true);
        fixture.detectChanges();

        expect(target.querySelector('.content')).not.toBeNull();
        target.remove();
    });

    it('mounts into a native HTMLElement container', () => {
        const target = document.createElement('div');
        document.body.appendChild(target);
        host.container.set(target);
        host.present.set(true);
        fixture.detectChanges();

        expect(target.querySelector('.content')).not.toBeNull();
        target.remove();
    });

    it('mounts into a CSS-selector container', () => {
        const target = document.createElement('div');
        target.id = 'selector-target';
        document.body.appendChild(target);
        host.container.set('#selector-target');
        host.present.set(true);
        fixture.detectChanges();

        expect(target.querySelector('.content')).not.toBeNull();
        target.remove();
    });

    it('falls back to body when the selector matches nothing', () => {
        host.container.set('#does-not-exist');
        host.present.set(true);
        fixture.detectChanges();

        expect(bodyContent()).not.toBeNull();
    });

    it('relocates the live nodes when the container changes while open', () => {
        host.present.set(true);
        fixture.detectChanges();
        const content = bodyContent()!;
        expect(content.parentElement).toBe(document.body);

        const target = document.createElement('div');
        document.body.appendChild(target);
        host.container.set(target);
        fixture.detectChanges();

        // same node, new parent
        expect(target.querySelector('.content')).toBe(content);
        target.remove();
    });

    it('removes the portaled nodes from body when destroyed (no orphans)', () => {
        host.present.set(true);
        fixture.detectChanges();
        expect(bodyContent()).not.toBeNull();

        fixture.destroy();

        expect(document.body.querySelector(':scope > .content')).toBeNull();
    });
});

describe('RdxPortalPresence — exit animation', () => {
    let fixture: ComponentFixture<PortalHostComponent>;
    let host: PortalHostComponent;
    let gcsSpy: MockInstance;

    const bodyContent = () => document.body.querySelector(':scope > .content') as HTMLElement | null;

    beforeEach(() => {
        gcsSpy = mockComputedStyle();
        fixture = TestBed.createComponent(PortalHostComponent);
        host = fixture.componentInstance;
        host.present.set(true);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        gcsSpy.mockRestore();
    });

    it('unmounts immediately when the closed state has no exit animation', () => {
        gcsSpy.mockImplementation(
            () => ({ animationName: 'none', display: 'block' }) as unknown as CSSStyleDeclaration
        );

        host.present.set(false);
        fixture.detectChanges();

        expect(bodyContent()).toBeNull();
    });

    it('suspends the unmount while a different exit animation runs', () => {
        host.present.set(false);
        fixture.detectChanges();

        expect(bodyContent()).not.toBeNull();
        expect(bodyContent()!.getAttribute('data-state')).toBe('closed');
    });

    it('unmounts once the exit animation ends', () => {
        host.present.set(false);
        fixture.detectChanges();
        const node = bodyContent()!;

        endAnimation(node);
        fixture.detectChanges();

        expect(bodyContent()).toBeNull();
    });

    it('keeps the view when re-opened during the exit animation', () => {
        const opened = bodyContent();

        host.present.set(false);
        fixture.detectChanges();
        expect(bodyContent()).not.toBeNull();

        host.present.set(true);
        fixture.detectChanges();

        // a late animationend must not tear down the re-opened content
        endAnimation(bodyContent()!);
        fixture.detectChanges();

        expect(bodyContent()).toBe(opened);
    });

    it('does not suspend when the animation name is unchanged between open and closed', () => {
        // node animates identically in both states (e.g. a spinner) → not a *fresh* exit animation
        const node = bodyContent()!;
        node.setAttribute('data-anim-always', 'spin');
        // the machine tracks the running animation via animationstart
        const startEvent = new Event('animationstart') as AnimationEvent & { animationName: string };
        startEvent.animationName = 'spin';
        node.dispatchEvent(startEvent);

        host.present.set(false);
        fixture.detectChanges();

        expect(bodyContent()).toBeNull();
    });
});

describe('RdxPortalPresence — multi-root (dialog-shaped) exit', () => {
    let fixture: ComponentFixture<MultiRootHostComponent>;
    let host: MultiRootHostComponent;
    let gcsSpy: MockInstance;

    const backdrop = () => document.body.querySelector(':scope > .backdrop') as HTMLElement | null;
    const popup = () => document.body.querySelector(':scope > .popup') as HTMLElement | null;

    beforeEach(() => {
        gcsSpy = mockComputedStyle();
        fixture = TestBed.createComponent(MultiRootHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        gcsSpy.mockRestore();
    });

    it('relocates every root node into the container', () => {
        expect(backdrop()).not.toBeNull();
        expect(popup()).not.toBeNull();
        expect(backdrop()!.parentElement).toBe(document.body);
        expect(popup()!.parentElement).toBe(document.body);
    });

    it('stays mounted until the only animated root (popup) finishes', () => {
        // backdrop has no exit keyframe; only the popup animates out
        host.backdropExit.set(null);
        host.popupExit.set('exit');
        // make backdrop report no animation even when closed
        host.present.set(false);
        backdrop()!.setAttribute('data-anim-always', 'none');
        fixture.detectChanges();

        // suspended by the popup's animation
        expect(backdrop()).not.toBeNull();
        expect(popup()).not.toBeNull();

        endAnimation(popup()!, 'exit');
        fixture.detectChanges();

        expect(backdrop()).toBeNull();
        expect(popup()).toBeNull();
    });

    it('unmounts only after the longer of two different exit animations ends', () => {
        host.backdropExit.set('fade');
        host.popupExit.set('zoom');
        host.present.set(false);
        fixture.detectChanges();

        expect(backdrop()).not.toBeNull();
        expect(popup()).not.toBeNull();

        // the shorter (backdrop) finishes first — view must stay until the popup also ends
        endAnimation(backdrop()!, 'fade');
        fixture.detectChanges();
        expect(backdrop()).not.toBeNull();
        expect(popup()).not.toBeNull();

        endAnimation(popup()!, 'zoom');
        fixture.detectChanges();
        expect(backdrop()).toBeNull();
        expect(popup()).toBeNull();
    });
});

describe('RdxPortalPresence — keepMounted', () => {
    let fixture: ComponentFixture<KeepMountedHostComponent>;
    let host: KeepMountedHostComponent;
    let gcsSpy: MockInstance;

    const bodyContent = () => document.body.querySelector(':scope > .content') as HTMLElement | null;

    beforeEach(() => {
        // keepMounted is orthogonal to exit animations — report none so mount/unmount is deterministic.
        gcsSpy = vi
            .spyOn(window, 'getComputedStyle')
            .mockReturnValue({ animationName: 'none', display: 'block' } as unknown as CSSStyleDeclaration);
        fixture = TestBed.createComponent(KeepMountedHostComponent);
        host = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        gcsSpy.mockRestore();
    });

    it('mounts while closed when keepMounted is true (consumer hides via data-state)', () => {
        host.keepMounted.set(true);
        fixture.detectChanges();

        const content = bodyContent();
        expect(content).not.toBeNull();
        // still in the DOM, but marked closed so the consumer's `data-closed` CSS hides it
        expect(content!.getAttribute('data-state')).toBe('closed');
    });

    it('does not mount while closed when keepMounted is false (default)', () => {
        fixture.detectChanges();

        expect(bodyContent()).toBeNull();
    });

    it('keeps the same node across a close while keepMounted is true', () => {
        host.present.set(true);
        host.keepMounted.set(true);
        fixture.detectChanges();
        const opened = bodyContent();
        expect(opened).not.toBeNull();

        host.present.set(false);
        fixture.detectChanges();

        expect(bodyContent()).toBe(opened);
        expect(bodyContent()!.getAttribute('data-state')).toBe('closed');
    });

    it('unmounts once keepMounted flips back to false while closed', () => {
        host.keepMounted.set(true);
        fixture.detectChanges();
        expect(bodyContent()).not.toBeNull();

        host.keepMounted.set(false);
        fixture.detectChanges();

        expect(bodyContent()).toBeNull();
    });
});

describe('RdxPortalPresence — server platform', () => {
    let gcsSpy: MockInstance;

    beforeEach(() => {
        gcsSpy = vi.spyOn(window, 'getComputedStyle');
        TestBed.configureTestingModule({
            providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
        });
    });

    afterEach(() => gcsSpy.mockRestore());

    it('renders in place, never relocates, and never reads computed style', () => {
        const fixture = TestBed.createComponent(PortalHostComponent);
        fixture.componentInstance.present.set(true);
        fixture.detectChanges();

        // rendered in its original spot, not portaled to body
        expect(fixture.nativeElement.querySelector('#origin .content')).not.toBeNull();
        expect(document.body.querySelector(':scope > .content')).toBeNull();
        expect(gcsSpy).not.toHaveBeenCalled();

        fixture.destroy();
    });
});
