import { ChangeDetectionStrategy, Component, Directive, ElementRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { type MockInstance, vi } from 'vitest';
import { animationDriver } from '../../core/__tests__/animation-driver';
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

@Component({
    imports: [TestPortalWrapper],
    providers: [provideRdxPresenceContext(() => ({ present: inject(DynamicRootsHost).present }))],
    template: `
        <ng-template [container]="container()" testPortal>
            <input class="retained" />
            @if (show()) {
                <div class="dynamic"></div>
            }
            @for (item of items(); track item) {
                <span class="item" [attr.data-key]="item"></span>
            }
        </ng-template>
    `
})
class DynamicRootsHost {
    readonly present = signal(true);
    readonly show = signal(false);
    readonly items = signal([1, 2]);
    readonly container = signal<RdxPortalContainer>(undefined);
}

describe('RdxPortalPresence — changing template roots', () => {
    it('retargets current @if/@for roots without recreating retained content and removes the complete range', async () => {
        const fixture = TestBed.createComponent(DynamicRootsHost);
        const target = document.createElement('div');
        document.body.appendChild(target);
        try {
            await fixture.whenStable();
            const retained = document.body.querySelector<HTMLInputElement>(':scope > .retained')!;
            const removed = document.body.querySelector(':scope > .item[data-key="1"]')!;
            const reused = document.body.querySelector(':scope > .item[data-key="2"]')!;
            retained.value = 'edited';
            fixture.componentInstance.show.set(true);
            fixture.componentInstance.items.set([2, 3]);
            await fixture.whenStable();
            fixture.componentInstance.container.set(target);
            await fixture.whenStable();
            expect(target.querySelector('.retained')).toBe(retained);
            expect(retained.value).toBe('edited');
            expect(target.querySelector('[data-key="2"]')).toBe(reused);
            expect(removed.isConnected).toBe(false);
            expect([...target.querySelectorAll('.dynamic, .item')].map((element) => element.className)).toEqual([
                'dynamic',
                'item',
                'item'
            ]);
            fixture.componentInstance.present.set(false);
            await fixture.whenStable();
            expect(target.childNodes.length).toBe(0);
        } finally {
            fixture.destroy();
            target.remove();
        }
    });

    it('waits for an exit animation on a root materialized after the portal mounted', async () => {
        const fixture = TestBed.createComponent(DynamicRootsHost);
        try {
            await fixture.whenStable();
            fixture.componentInstance.show.set(true);
            await fixture.whenStable();
            const dynamic = document.body.querySelector<HTMLElement>(':scope > .dynamic')!;
            const motion = animationDriver();
            dynamic.getAnimations = () => [motion.animation];
            fixture.componentInstance.present.set(false);
            await fixture.whenStable();
            expect(dynamic.isConnected).toBe(true);
            await motion.finish();
            await fixture.whenStable();
            expect(dynamic.isConnected).toBe(false);
        } finally {
            fixture.destroy();
        }
    });
});

describe('RdxPortalPresence — portaling', () => {
    let fixture: ComponentFixture<PortalHostComponent>;
    let host: PortalHostComponent;

    const bodyContent = () => document.body.querySelector(':scope > .content') as HTMLElement | null;
    const originContent = () => fixture.nativeElement.querySelector('#origin .content') as HTMLElement | null;

    beforeEach(() => {
        fixture = TestBed.createComponent(PortalHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
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

describe('RdxPortalPresence — render lifetime', () => {
    it('retains portaled Angular views until every explicit root finishes', async () => {
        const fixture = TestBed.createComponent(MultiRootHostComponent);
        await fixture.whenStable();
        const roots = ['backdrop', 'popup'].map(
            (name) => document.body.querySelector(`:scope > .${name}`) as HTMLElement
        );
        const motions = roots.map((root) => {
            const motion = animationDriver();
            root.getAnimations = () => [motion.animation];
            return motion;
        });
        fixture.componentInstance.present.set(false);
        await fixture.whenStable();
        await motions[0].finish();
        await fixture.whenStable();
        expect(roots.every((root) => root.isConnected)).toBe(true);
        await motions[1].finish();
        await fixture.whenStable();
        expect(roots.some((root) => root.isConnected)).toBe(false);
    });

    it('preserves a reopened portal and ignores a completion from its old close', async () => {
        const fixture = TestBed.createComponent(PortalHostComponent);
        fixture.componentInstance.present.set(true);
        await fixture.whenStable();
        const initial = document.body.querySelector(':scope > .content') as HTMLElement;
        const motion = animationDriver();
        initial.getAnimations = () => [motion.animation];
        fixture.componentInstance.present.set(false);
        await fixture.whenStable();
        expect(initial.isConnected).toBe(true);
        fixture.componentInstance.present.set(true);
        await motion.finish();
        await fixture.whenStable();
        expect(document.body.querySelector(':scope > .content')).toBe(initial);
    });

    it('removes a pending exit on disposal and ignores its late promise', async () => {
        const fixture = TestBed.createComponent(PortalHostComponent);
        fixture.componentInstance.present.set(true);
        await fixture.whenStable();
        const initial = document.body.querySelector(':scope > .content') as HTMLElement;
        const motion = animationDriver();
        initial.getAnimations = () => [motion.animation];
        fixture.componentInstance.present.set(false);
        await fixture.whenStable();
        fixture.destroy();
        await motion.finish();
        await Promise.resolve();
        await Promise.resolve();
        expect(initial.isConnected).toBe(false);
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
