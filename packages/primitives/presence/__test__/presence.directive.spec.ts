import { ChangeDetectionStrategy, Component, Directive, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, type MockInstance } from 'vitest';
import { provideRdxPresenceContext, RdxPresenceDirective } from '../src/presence.directive';

// Wrapper that mirrors how real consumers apply the presence directive:
// a selectored `ng-template` directive composing RdxPresenceDirective via hostDirectives.
@Directive({
    selector: 'ng-template[testPresence]',
    standalone: true,
    hostDirectives: [RdxPresenceDirective]
})
class TestPresenceWrapper {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-presence-host',
    standalone: true,
    imports: [TestPresenceWrapper],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceHostComponent).present }))],
    template: `
        <ng-template testPresence>
            <span class="content">content</span>
        </ng-template>
    `
})
class PresenceHostComponent {
    readonly present = signal(false);
}

// Host whose content carries a `data-state` driving a (mocked) exit `@keyframes`.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-presence-anim-host',
    standalone: true,
    imports: [TestPresenceWrapper],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceAnimHostComponent).present }))],
    template: `
        <ng-template testPresence>
            <span class="content" [attr.data-state]="present() ? 'open' : 'closed'">content</span>
        </ng-template>
    `
})
class PresenceAnimHostComponent {
    readonly present = signal(true);
}

// Multi-root template (backdrop + content) where only the *second* root carries the exit
// `@keyframes`. Guards the regression where `mountView()` watched only the first root node.
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'test-presence-multiroot-host',
    standalone: true,
    imports: [TestPresenceWrapper],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceMultiRootHostComponent).present }))],
    template: `
        <ng-template testPresence>
            <span class="backdrop">backdrop</span>
            <span class="content" [attr.data-state]="present() ? 'open' : 'closed'">content</span>
        </ng-template>
    `
})
class PresenceMultiRootHostComponent {
    readonly present = signal(true);
}

describe('RdxPresenceDirective', () => {
    let fixture: ComponentFixture<PresenceHostComponent>;
    let host: PresenceHostComponent;

    const content = () => fixture.nativeElement.querySelector('.content') as HTMLElement | null;

    beforeEach(() => {
        fixture = TestBed.createComponent(PresenceHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('does not render the content while present() is false', () => {
        expect(content()).toBeNull();
    });

    it('mounts the content when present() becomes true', () => {
        host.present.set(true);
        fixture.detectChanges();

        expect(content()).not.toBeNull();
        expect(content()!.textContent).toContain('content');
    });

    it('removes the content when present() becomes false', () => {
        host.present.set(true);
        fixture.detectChanges();
        expect(content()).not.toBeNull();

        host.present.set(false);
        fixture.detectChanges();
        expect(content()).toBeNull();
    });

    it('re-creates the view when toggled true again', () => {
        host.present.set(true);
        fixture.detectChanges();
        const first = content();

        host.present.set(false);
        fixture.detectChanges();

        host.present.set(true);
        fixture.detectChanges();
        const second = content();

        expect(second).not.toBeNull();
        // a brand new embedded view, not the same DOM node
        expect(second).not.toBe(first);
    });

    it('renders bindings in the same change-detection cycle (no deferred tick)', () => {
        host.present.set(true);
        fixture.detectChanges();

        // content is present immediately after the first detectChanges, no extra cycle needed
        expect(content()).not.toBeNull();
    });

    it('destroys the embedded view when the host is destroyed', () => {
        host.present.set(true);
        fixture.detectChanges();
        expect(content()).not.toBeNull();

        fixture.destroy();

        expect(fixture.nativeElement.querySelector('.content')).toBeNull();
    });
});

describe('RdxPresenceDirective — exit animation', () => {
    let fixture: ComponentFixture<PresenceAnimHostComponent>;
    let host: PresenceAnimHostComponent;
    let gcsSpy: MockInstance;

    const content = () => fixture.nativeElement.querySelector('.content') as HTMLElement | null;

    const endAnimation = (node: HTMLElement, animationName = 'exit') => {
        const event = new Event('animationend') as AnimationEvent & { animationName: string };
        event.animationName = animationName;
        node.dispatchEvent(event);
    };

    beforeEach(() => {
        // jsdom does not run CSS, so emulate `[data-state='closed'] { animation: exit ... }`.
        gcsSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
            (el: Element) =>
                ({
                    animationName: el.getAttribute?.('data-state') === 'closed' ? 'exit' : 'none',
                    display: 'block'
                }) as unknown as CSSStyleDeclaration
        );

        fixture = TestBed.createComponent(PresenceAnimHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => gcsSpy.mockRestore());

    it('keeps the content mounted while the exit animation is running', () => {
        expect(content()).not.toBeNull();

        host.present.set(false);
        fixture.detectChanges();

        // suspended — still in the DOM until the animation ends
        expect(content()).not.toBeNull();
        expect(content()!.getAttribute('data-state')).toBe('closed');
    });

    it('unmounts once the exit animation ends', () => {
        host.present.set(false);
        fixture.detectChanges();
        const node = content();
        expect(node).not.toBeNull();

        endAnimation(node!);
        fixture.detectChanges();

        expect(content()).toBeNull();
    });

    it('does not unmount on an unrelated animationend', () => {
        host.present.set(false);
        fixture.detectChanges();
        const node = content()!;

        endAnimation(node, 'something-else');
        fixture.detectChanges();

        expect(content()).not.toBeNull();
    });

    it('cancels the pending unmount when re-opened before the animation ends', () => {
        const opened = content();

        host.present.set(false);
        fixture.detectChanges();
        expect(content()).not.toBeNull();

        // re-open mid-animation
        host.present.set(true);
        fixture.detectChanges();

        // a late animationend must not tear down the re-opened content
        endAnimation(content()!);
        fixture.detectChanges();

        expect(content()).not.toBeNull();
        // same view was kept, not re-created
        expect(content()).toBe(opened);
    });
});

describe('RdxPresenceDirective — multi-root exit animation', () => {
    let fixture: ComponentFixture<PresenceMultiRootHostComponent>;
    let host: PresenceMultiRootHostComponent;
    let gcsSpy: MockInstance;

    const content = () => fixture.nativeElement.querySelector('.content') as HTMLElement | null;
    const backdrop = () => fixture.nativeElement.querySelector('.backdrop') as HTMLElement | null;

    const endAnimation = (node: HTMLElement, animationName = 'exit') => {
        const event = new Event('animationend') as AnimationEvent & { animationName: string };
        event.animationName = animationName;
        node.dispatchEvent(event);
    };

    beforeEach(() => {
        // Only the element with `data-state='closed'` (the content root) animates; the backdrop never does.
        gcsSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(
            (el: Element) =>
                ({
                    animationName: el.getAttribute?.('data-state') === 'closed' ? 'exit' : 'none',
                    display: 'block'
                }) as unknown as CSSStyleDeclaration
        );

        fixture = TestBed.createComponent(PresenceMultiRootHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => gcsSpy.mockRestore());

    it('stays mounted while an exit animation on a non-first root is running', () => {
        expect(content()).not.toBeNull();
        expect(backdrop()).not.toBeNull();

        host.present.set(false);
        fixture.detectChanges();

        // The exit animation lives on the second root (content); the view must stay mounted.
        expect(content()).not.toBeNull();
        expect(content()!.getAttribute('data-state')).toBe('closed');
    });

    it('unmounts once the second-root exit animation ends', () => {
        host.present.set(false);
        fixture.detectChanges();
        const node = content();
        expect(node).not.toBeNull();

        endAnimation(node!);
        fixture.detectChanges();

        expect(content()).toBeNull();
        expect(backdrop()).toBeNull();
    });
});
