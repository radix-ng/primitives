import { Component, DestroyRef, ElementRef, inject, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PresenceMachine } from '../src/presence-machine';

@Component({ template: '' })
class Host {
    readonly present = signal(true);
    readonly hold = signal(false);
    readonly skip = signal(false);
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    node!: HTMLElement;
    removals = 0;
    readonly machine = new PresenceMachine({
        present: this.present,
        holdUnmount: this.hold,
        skipExitAnimation: this.skip,
        isBrowser: true,
        injector: inject(Injector),
        mountView: () => {
            this.node = document.createElement('div');
            this.element.appendChild(this.node);
            return [this.node];
        },
        destroyView: () => {
            this.node.remove();
            this.removals++;
        }
    });
    constructor() {
        inject(DestroyRef).onDestroy(() => this.machine.dispose());
    }
}

describe('Presence owner unmount boundary', () => {
    async function render() {
        const fixture = TestBed.createComponent(Host);
        await fixture.whenStable();
        return { fixture, host: fixture.componentInstance };
    }

    it('holds a zero-motion exit until its owner releases it', async () => {
        const { fixture, host } = await render();
        host.hold.set(true);
        host.present.set(false);
        await fixture.whenStable();
        expect(host.node.isConnected).toBe(true);
        host.hold.set(false);
        await fixture.whenStable();
        expect(host.node.isConnected).toBe(false);
        expect(host.removals).toBe(1);
    });

    it('cancels a held removal when the view reopens', async () => {
        const { fixture, host } = await render();
        const initial = host.node;
        host.hold.set(true);
        host.present.set(false);
        await fixture.whenStable();
        host.present.set(true);
        host.hold.set(false);
        await fixture.whenStable();
        expect(host.node).toBe(initial);
        expect(initial.isConnected).toBe(true);
        expect(host.removals).toBe(0);
    });

    it('still waits for an unfinished CSS exit after the owner releases its hold', async () => {
        const { fixture, host } = await render();
        host.node.style.animationName = 'exit';
        host.hold.set(true);
        host.present.set(false);
        await fixture.whenStable();
        host.hold.set(false);
        await fixture.whenStable();
        expect(host.node.isConnected).toBe(true);
        host.node.dispatchEvent(Object.assign(new Event('animationend'), { animationName: 'exit' }));
        expect(host.node.isConnected).toBe(false);
    });

    it('lets explicit completion bypass the hold', async () => {
        const { fixture, host } = await render();
        host.hold.set(true);
        host.present.set(false);
        await fixture.whenStable();
        host.skip.set(true);
        await fixture.whenStable();
        expect(host.node.isConnected).toBe(false);
        expect(host.removals).toBe(1);
    });

    it('disposes a held view without waiting for release', async () => {
        const { fixture, host } = await render();
        host.hold.set(true);
        host.present.set(false);
        await fixture.whenStable();
        fixture.destroy();
        expect(host.node.isConnected).toBe(false);
        expect(host.removals).toBe(1);
    });
});
