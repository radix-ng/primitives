import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { _importsSelect, RdxSelectOpenChangeEvent, RdxSelectRoot } from '../index';

@Component({
    imports: [_importsSelect],
    template: `
        <div
            [(open)]="open"
            (onOpenChange)="onChange($event)"
            (onOpenChangeComplete)="completions.push($event)"
            rdxSelectRoot
        >
            <button rdxSelectTrigger>Fruit</button>
            <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                <div rdxSelectPositioner>
                    <div rdxSelectPopup>
                        <div rdxSelectList>
                            <div value="Apple" rdxSelectItem><span rdxSelectItemText>Apple</span></div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
class Host {
    readonly open = signal(false);
    readonly keepMounted = signal(false);
    readonly hold = signal(false);
    readonly cancel = signal(false);
    readonly changes: RdxSelectOpenChangeEvent[] = [];
    readonly completions: boolean[] = [];
    onChange(change: RdxSelectOpenChangeEvent) {
        this.changes.push(change);
        if (!change.open && this.hold()) change.eventDetails.preventUnmountOnClose();
        if (!change.open && this.cancel()) change.eventDetails.cancel();
    }
}

describe('Select imperative actions', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;
    let root: RdxSelectRoot;
    const popup = () => document.querySelector('[rdxSelectPopup]');
    const closedCompletions = () => host.completions.filter((open) => !open);
    const settle = async () => {
        await fixture.whenStable();
    };

    beforeEach(async () => {
        fixture = TestBed.createComponent(Host);
        host = fixture.componentInstance;
        await settle();
        root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
    });

    it('closes through the cancelable imperative-action event and drops a redundant close', async () => {
        expect(root.close()).toBe(false);
        expect(host.changes).toEqual([]);
        host.open.set(true);
        await settle();
        expect(root.close()).toBe(true);
        expect(host.changes.at(-1)?.eventDetails.reason).toBe('imperative-action');
        expect(host.changes.at(-1)?.eventDetails.trigger).toBe(
            fixture.nativeElement.querySelector('[rdxSelectTrigger]')
        );
        await settle();
        expect(popup()).toBeNull();
        expect(closedCompletions()).toEqual([false]);
        expect(root.close()).toBe(false);
        root.unmount();
        await settle();
        expect(closedCompletions()).toEqual([false]);
    });

    it('keeps a closed popup until unmount and completes closing exactly once', async () => {
        host.hold.set(true);
        host.open.set(true);
        await settle();
        root.close();
        await settle();
        expect(host.open()).toBe(false);
        expect(popup()).not.toBeNull();
        expect(root.transitionStatus()).toBe('ending');
        expect(closedCompletions()).toEqual([]);
        expect(document.querySelector('[rdxSelectPositioner]')).toHaveAttribute('inert', '');
        popup()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        document.querySelector('[rdxSelectItem]')?.dispatchEvent(new Event('pointerup', { bubbles: true }));
        expect(root.value()).toBeNull();
        root.unmount();
        root.unmount();
        await settle();
        expect(popup()).toBeNull();
        expect(root.transitionStatus()).toBeUndefined();
        expect(closedCompletions()).toEqual([false]);
    });

    it('discards a canceled hold and closes automatically on the next accepted request', async () => {
        host.open.set(true);
        host.hold.set(true);
        host.cancel.set(true);
        await settle();
        expect(root.close()).toBe(false);
        await settle();
        expect(host.open()).toBe(true);
        expect(popup()).not.toBeNull();
        host.hold.set(false);
        host.cancel.set(false);
        root.close();
        await settle();
        expect(popup()).toBeNull();
        expect(closedCompletions()).toEqual([false]);
    });

    it('supports close and unmount in one batch, without leaking into the next open', async () => {
        host.hold.set(true);
        host.open.set(true);
        await settle();
        root.close();
        root.unmount();
        await settle();
        expect(popup()).toBeNull();
        root.setOpen(true);
        root.unmount();
        await settle();
        expect(popup()).not.toBeNull();
        host.hold.set(false);
        root.close();
        await settle();
        expect(popup()).toBeNull();
        expect(closedCompletions()).toEqual([false, false]);
    });

    it('finishes a keep-mounted closing phase while preserving the portal view', async () => {
        host.keepMounted.set(true);
        host.hold.set(true);
        host.open.set(true);
        await settle();
        const element = popup();
        root.close();
        await settle();
        root.unmount();
        await settle();
        expect(popup()).toBe(element);
        expect(root.transitionStatus()).toBeUndefined();
        expect(closedCompletions()).toEqual([false]);
        host.keepMounted.set(false);
        await settle();
        expect(popup()).toBeNull();
        expect(closedCompletions()).toEqual([false]);
    });
});
