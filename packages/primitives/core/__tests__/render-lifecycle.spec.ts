import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { useRenderLifecycle } from '../src/composables/use-render-lifecycle';
import { animationDriver } from './animation-driver';

@Component({ template: '' })
class Host {
    readonly open = signal(true);
    readonly hold = signal(false);
    readonly completions: boolean[] = [];
    readonly lifecycle = useRenderLifecycle((open) => this.completions.push(open), {
        open: this.open,
        holdUnmount: this.hold
    });
}

describe('signal render lifetime', () => {
    async function render() {
        const fixture = TestBed.createComponent(Host);
        const host = fixture.componentInstance;
        host.lifecycle.start(true);
        await fixture.whenStable();
        return { fixture, host };
    }

    it('holds a completed exit until the owner releases its boundary', async () => {
        const { fixture, host } = await render();
        host.hold.set(true);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(true);
        expect(host.lifecycle.isExitPending).toBe(false);
        host.hold.set(false);
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
        expect(host.completions.filter((open) => !open)).toEqual([false]);
    });

    it('adopts a reopen before the render effect observes it', async () => {
        const { fixture, host } = await render();
        const motion = animationDriver();
        const node = document.createElement('div');
        node.getAnimations = () => [motion.animation];
        host.lifecycle.registerElement(node);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        host.open.set(true);
        await motion.finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(true);
        expect(host.completions.filter((open) => !open)).toEqual([]);
    });

    it('ignores an enter completion when a close commits before its render effect', async () => {
        const { fixture, host } = await render();
        const motion = animationDriver();
        const node = document.createElement('div');
        node.getAnimations = () => [motion.animation];
        host.lifecycle.registerElement(node);
        host.lifecycle.start(true);
        await vi.waitFor(() => expect(host.lifecycle.status()).toBeUndefined());
        const completions = host.completions.length;
        host.open.set(false);
        await motion.finish();
        await fixture.whenStable();
        expect(host.completions).toHaveLength(completions);
        // Intent alone does not destroy the live view: its owner must start the closing phase.
        expect(host.lifecycle.mounted()).toBe(true);
        host.lifecycle.start(false);
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
        expect(host.completions.at(-1)).toBe(false);
    });

    it('waits for motion after the owner releases its hold', async () => {
        const { fixture, host } = await render();
        const motion = animationDriver();
        const node = document.createElement('div');
        node.getAnimations = () => [motion.animation];
        host.lifecycle.registerElement(node);
        host.hold.set(true);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        host.hold.set(false);
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(true);
        await motion.finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
    });

    it('waits for a replacement animation after cancellation, ignoring infinite peers', async () => {
        const { fixture, host } = await render();
        const first = animationDriver();
        const replacement = animationDriver();
        const spinner = animationDriver(Infinity);
        let current = first.animation;
        const node = document.createElement('div');
        node.getAnimations = () => [current, spinner.animation];
        host.lifecycle.registerElement(node);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        current = replacement.animation;
        await first.cancel();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(true);
        await replacement.finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
    });

    it('waits for all explicit participants and reference-counts duplicate registration', async () => {
        const { fixture, host } = await render();
        const motions = [animationDriver(), animationDriver()];
        for (const motion of motions) {
            const node = document.createElement('div');
            node.getAnimations = () => [motion.animation];
            host.lifecycle.registerElement(node);
            host.lifecycle.registerElement(node)();
        }
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        await motions[0].finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(true);
        await motions[1].finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
    });

    it('lets an explicit unmount bypass a hold without notifying twice', async () => {
        const { fixture, host } = await render();
        host.hold.set(true);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        host.lifecycle.unmount();
        host.lifecycle.unmount();
        host.hold.set(false);
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
        expect(host.lifecycle.status()).toBeUndefined();
        expect(host.completions.filter((open) => !open)).toEqual([]);
    });

    it('releases a removed animation participant during an exit', async () => {
        const { fixture, host } = await render();
        const motion = animationDriver();
        const node = document.createElement('div');
        node.getAnimations = () => [motion.animation];
        const unregister = host.lifecycle.registerElement(node);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        expect(host.lifecycle.isExitPending).toBe(true);
        unregister();
        expect(host.lifecycle.isExitPending).toBe(true);
        await fixture.whenStable();
        expect(host.lifecycle.isExitPending).toBe(false);
        expect(host.lifecycle.mounted()).toBe(false);
        expect(host.completions.filter((open) => !open)).toEqual([false]);
        await motion.finish();
        expect(host.completions.filter((open) => !open)).toEqual([false]);
    });

    it('includes a participant added during an exit', async () => {
        const { fixture, host } = await render();
        const first = animationDriver();
        const added = animationDriver();
        const node = document.createElement('div');
        node.getAnimations = () => [first.animation];
        host.lifecycle.registerElement(node);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        const next = document.createElement('div');
        next.getAnimations = () => [added.animation];
        host.lifecycle.registerElement(next);
        await fixture.whenStable();
        await first.finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(true);
        await added.finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
        expect(host.completions.filter((open) => !open)).toEqual([false]);
    });

    it('waits for a target added after motion completed at an owner hold', async () => {
        const { fixture, host } = await render();
        host.hold.set(true);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        const motion = animationDriver();
        const node = document.createElement('div');
        node.getAnimations = () => [motion.animation];
        host.lifecycle.registerElement(node);
        host.hold.set(false);
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(true);
        await motion.finish();
        await fixture.whenStable();
        expect(host.lifecycle.mounted()).toBe(false);
    });

    it('invalidates motion callbacks when its owner is destroyed', async () => {
        const { fixture, host } = await render();
        const motion = animationDriver();
        const node = document.createElement('div');
        node.getAnimations = () => [motion.animation];
        host.lifecycle.registerElement(node);
        host.open.set(false);
        host.lifecycle.start(false);
        await fixture.whenStable();
        fixture.destroy();
        await motion.finish();
        await Promise.resolve();
        await Promise.resolve();
        expect(host.completions.filter((open) => !open)).toEqual([]);
    });
});
