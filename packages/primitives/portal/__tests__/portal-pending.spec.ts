import { Component, DestroyRef, Directive, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRdxPresenceContext } from '@radix-ng/primitives/presence';
import { RdxPortal, RdxPortalPresence, type RdxPortalContainer } from '../index';

@Directive({
    selector: 'ng-template[pendingPortal]',
    hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container', 'keepMounted'] }]
})
class PendingPortal {}

@Directive({ selector: '[mountProbe]' })
class MountProbe {
    constructor() {
        const host = inject(PendingHost);
        host.mounts++;
        inject(DestroyRef).onDestroy(() => host.destroys++);
    }
}

@Component({
    imports: [PendingPortal, MountProbe],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PendingHost).present }))],
    template: `
        <ng-template [container]="target()" [keepMounted]="keepMounted()" pendingPortal>
            <input data-pending-root mountProbe />
            <span data-pending-sibling>Second root</span>
        </ng-template>
    `
})
class PendingHost {
    readonly target = signal<RdxPortalContainer | null | undefined>(null);
    readonly present = signal(true);
    readonly keepMounted = signal(false);
    mounts = 0;
    destroys = 0;
}

@Component({
    imports: [RdxPortal],
    template: `
        @if (show()) {
            <div [container]="target()" rdxPortal><input value="Initial" /></div>
        }
    `
})
class AttributeHost {
    readonly target = signal<RdxPortalContainer | null | undefined>(null);
    readonly portal = viewChild(RdxPortal);
    readonly show = signal(true);
}

describe('Portal pending destinations', () => {
    for (const retained of [false, true]) {
        it(`does not create a structural view before its target exists (keepMounted=${retained})`, async () => {
            const fixture = TestBed.createComponent(PendingHost);
            const host = fixture.componentInstance;
            host.keepMounted.set(retained);
            await fixture.whenStable();
            expect(host.mounts).toBe(0);
            expect(document.querySelector('[data-pending-root]')).toBeNull();
            expect(fixture.nativeElement.querySelector('[data-pending-root]')).toBeNull();
            host.target.set(document.body);
            await fixture.whenStable();
            expect(host.mounts).toBe(1);
            expect(document.querySelector('[data-pending-root]')?.parentNode).toBe(document.body);
            host.target.set(null);
            await fixture.whenStable();
            expect(host.destroys).toBe(1);
            expect(document.querySelector('[data-pending-root], [data-pending-sibling]')).toBeNull();
            host.target.set(undefined);
            await fixture.whenStable();
            expect(host.mounts).toBe(2);
            expect(document.querySelector('[data-pending-root]')?.parentNode).toBe(document.body);
            fixture.destroy();
            expect(host.destroys).toBe(2);
            expect(document.querySelector('[data-pending-root], [data-pending-sibling]')).toBeNull();
        });
    }

    it('invalidates a pending exit when the destination becomes null', async () => {
        const fixture = TestBed.createComponent(PendingHost);
        const host = fixture.componentInstance;
        host.target.set(document.body);
        await fixture.whenStable();
        const root = document.querySelector<HTMLElement>('[data-pending-root]')!;
        let finish!: () => void;
        root.getAnimations = () => [
            {
                playState: 'running',
                pending: true,
                startTime: null,
                finished: new Promise<void>((resolve) => (finish = resolve))
            } as Animation
        ];
        host.present.set(false);
        await fixture.whenStable();
        expect(root.isConnected).toBe(true);
        host.target.set(null);
        await fixture.whenStable();
        expect(root.isConnected).toBe(false);
        host.target.set(document.body);
        host.present.set(true);
        await fixture.whenStable();
        const reopened = document.querySelector('[data-pending-root]');
        expect(reopened).not.toBe(root);
        finish();
        await fixture.whenStable();
        expect(reopened?.isConnected).toBe(true);
        fixture.destroy();
    });

    it('waits while closed with keepMounted and mounts a retained view only after resolving the target', async () => {
        const fixture = TestBed.createComponent(PendingHost);
        const host = fixture.componentInstance;
        host.present.set(false);
        host.keepMounted.set(true);
        await fixture.whenStable();
        expect(host.mounts).toBe(0);
        host.target.set(document.body);
        await fixture.whenStable();
        expect(host.mounts).toBe(1);
        expect(document.querySelector('[data-pending-root]')).not.toBeNull();
        host.keepMounted.set(false);
        await fixture.whenStable();
        expect(document.querySelector('[data-pending-root]')).toBeNull();
        fixture.destroy();
    });

    it('does not serialize a pending structural view on the server', async () => {
        TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
        const fixture = TestBed.createComponent(PendingHost);
        await fixture.whenStable();
        expect(fixture.componentInstance.mounts).toBe(0);
        expect(fixture.nativeElement.querySelector('[data-pending-root]')).toBeNull();
        fixture.destroy();
    });

    it('compares iframe exit animations against their owning document timeline', async () => {
        const frame = document.createElement('iframe');
        document.body.append(frame);
        const child = frame.contentDocument!;
        const timeline = Object.getOwnPropertyDescriptor(document, 'timeline');
        Object.defineProperty(document, 'timeline', { configurable: true, value: { currentTime: 1000 } });
        Object.defineProperty(child, 'timeline', { configurable: true, value: { currentTime: 10 } });
        const fixture = TestBed.createComponent(PendingHost);
        try {
            const host = fixture.componentInstance;
            host.target.set(child.body);
            await fixture.whenStable();
            const root = child.querySelector<HTMLElement>('[data-pending-root]')!;
            root.getAnimations = () => [
                {
                    playState: 'running',
                    pending: false,
                    startTime: 20,
                    finished: new Promise<void>(() => {})
                } as Animation
            ];
            host.present.set(false);
            await fixture.whenStable();
            expect(root.isConnected).toBe(true);
            host.target.set(null);
            await fixture.whenStable();
            expect(root.isConnected).toBe(false);
        } finally {
            fixture.destroy();
            if (timeline) Object.defineProperty(document, 'timeline', timeline);
            else Reflect.deleteProperty(document, 'timeline');
            frame.remove();
        }
    });

    it('detaches an attribute host while pending and reconnects the existing view', async () => {
        const fixture = TestBed.createComponent(AttributeHost);
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('[rdxPortal]')).toBeNull();
        fixture.componentInstance.target.set(document.body);
        await fixture.whenStable();
        const element = document.body.querySelector<HTMLElement>(':scope > [rdxPortal]')!;
        const input = element.querySelector('input')!;
        input.value = 'Edited';
        fixture.componentInstance.portal()!.setContainer(null);
        await fixture.whenStable();
        expect(element.isConnected).toBe(false);
        fixture.componentInstance.portal()!.setContainer(undefined);
        await fixture.whenStable();
        expect(document.body.querySelector(':scope > [rdxPortal]')).toBe(element);
        expect(input.value).toBe('Edited');
        fixture.componentInstance.portal()!.setContainer(null);
        await fixture.whenStable();
        fixture.componentInstance.show.set(false);
        await fixture.whenStable();
        fixture.destroy();
        expect(element.isConnected).toBe(false);
    });
});
