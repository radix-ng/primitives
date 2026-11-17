import { ChangeDetectionStrategy, Component, Directive, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { animationDriver } from '../../core/__tests__/animation-driver';
import { RdxPresenceTarget } from '../src/presence-target';
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

describe('RdxPresenceDirective — live view ownership', () => {
    it('retains the same view through an interrupted exit and ignores stale completion', async () => {
        const fixture = TestBed.createComponent(PresenceAnimHostComponent);
        await fixture.whenStable();
        const initial = fixture.nativeElement.querySelector('.content') as HTMLElement;
        const motion = animationDriver();
        initial.getAnimations = () => [motion.animation];
        fixture.componentInstance.present.set(false);
        await fixture.whenStable();
        expect(initial.isConnected).toBe(true);
        fixture.componentInstance.present.set(true);
        await motion.finish();
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('.content')).toBe(initial);
    });

    it('destroys every root only after the last participating animation completes', async () => {
        const fixture = TestBed.createComponent(PresenceMultiRootHostComponent);
        await fixture.whenStable();
        const content = fixture.nativeElement.querySelector('.content') as HTMLElement;
        const backdrop = fixture.nativeElement.querySelector('.backdrop') as HTMLElement;
        const first = animationDriver();
        const second = animationDriver();
        content.getAnimations = () => [first.animation];
        backdrop.getAnimations = () => [second.animation];
        fixture.componentInstance.present.set(false);
        await fixture.whenStable();
        await first.finish();
        await fixture.whenStable();
        expect(content.isConnected).toBe(true);
        await second.finish();
        await fixture.whenStable();
        expect(content.isConnected).toBe(false);
        expect(backdrop.isConnected).toBe(false);
    });
});

@Component({
    imports: [TestPresenceWrapper, RdxPresenceTarget],
    providers: [provideRdxPresenceContext(() => ({ present: inject(ExplicitTargetHost).present }))],
    template: `
        <ng-template testPresence>
            <div>
                <span rdxPresenceTarget>Animated</span>
                <i>Unrelated</i>
            </div>
        </ng-template>
    `
})
class ExplicitTargetHost {
    readonly present = signal(true);
}

@Component({
    selector: 'presence-target-child',
    imports: [RdxPresenceTarget],
    template: '<span rdxPresenceTarget>Child</span>'
})
class TargetChild {}

@Component({
    imports: [TestPresenceWrapper, TargetChild],
    providers: [provideRdxPresenceContext(() => ({ present: inject(ChildTargetHost).present }))],
    template: '<ng-template testPresence><presence-target-child /></ng-template>'
})
class ChildTargetHost {
    readonly present = signal(true);
}

describe('RdxPresenceTarget', () => {
    it('registers an element declared inside a child component template', async () => {
        const fixture = TestBed.createComponent(ChildTargetHost);
        await fixture.whenStable();
        const target = fixture.nativeElement.querySelector('span') as HTMLElement;
        const motion = animationDriver();
        target.getAnimations = () => [motion.animation];
        fixture.componentInstance.present.set(false);
        await fixture.whenStable();
        expect(target.isConnected).toBe(true);
        await motion.finish();
        await fixture.whenStable();
        expect(target.isConnected).toBe(false);
    });

    it('observes an explicit descendant and excludes arbitrary siblings', async () => {
        const fixture = TestBed.createComponent(ExplicitTargetHost);
        await fixture.whenStable();
        const target = fixture.nativeElement.querySelector('span') as HTMLElement;
        const sibling = fixture.nativeElement.querySelector('i') as HTMLElement;
        const exit = animationDriver();
        const unrelated = animationDriver();
        target.getAnimations = () => [exit.animation];
        sibling.getAnimations = () => [unrelated.animation];
        fixture.componentInstance.present.set(false);
        await fixture.whenStable();
        expect(target.isConnected).toBe(true);
        await exit.finish();
        await fixture.whenStable();
        expect(target.isConnected).toBe(false);
    });
});
