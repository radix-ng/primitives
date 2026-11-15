import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxMenuRoot } from '../index';

@Component({ imports: [RdxMenuRoot], template: '<div rdxMenuRoot></div>' })
class Host {
    readonly root = viewChild.required(RdxMenuRoot);
}

describe('Menu popup collection lifetime', () => {
    it('clears highlight when the current popup is destroyed while Root stays open', async () => {
        const fixture = TestBed.createComponent(Host);
        await fixture.whenStable();
        const root = fixture.componentInstance.root();
        root.open.set(true);
        const unregister = root.registerPopup(document.createElement('div'));
        root.setActiveIndex(1);
        unregister();
        expect(root.open()).toBe(true);
        expect(root.activeIndex()).toBeNull();
        expect(root.popupElement()).toBeUndefined();
        fixture.destroy();
    });

    it('does not clear a newer popup collection when an older registration is disposed', async () => {
        const fixture = TestBed.createComponent(Host);
        await fixture.whenStable();
        const root = fixture.componentInstance.root();
        root.open.set(true);
        const unregisterOld = root.registerPopup(document.createElement('div'));
        const current = document.createElement('div');
        const unregisterCurrent = root.registerPopup(current);
        root.setActiveIndex(1);
        unregisterOld();
        expect(root.popupElement()).toBe(current);
        expect(root.activeIndex()).toBe(1);
        unregisterCurrent();
        fixture.destroy();
    });
});
