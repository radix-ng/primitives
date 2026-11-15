import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxContextMenuRoot } from '@radix-ng/primitives/context-menu';
import { RdxMenubarRoot } from '@radix-ng/primitives/menubar';
import { Align, SideOrLogical } from '@radix-ng/primitives/popper';
import { menuImports, RdxMenuPositioner } from '../index';

@Component({
    imports: [menuImports, RdxMenubarRoot, RdxContextMenuRoot],
    template: `
        <div rdxMenuRoot>
            <button rdxMenuTrigger>Actions</button>
            <div data-case="plain" rdxMenuPositioner></div>
            <div rdxMenuRoot>
                <button rdxMenuSubTrigger>More</button>
                <div data-case="sub" rdxMenuPositioner></div>
            </div>
        </div>
        <div [orientation]="orientation()" rdxMenubarRoot>
            <div rdxMenuRoot>
                <button rdxMenuTrigger>File</button>
                <div data-case="bar" rdxMenuPositioner></div>
            </div>
        </div>
        <div rdxContextMenuRoot>
            <div data-case="context" rdxMenuPositioner></div>
            <div [side]="side()" [align]="align()" data-case="context-inputs" rdxMenuPositioner></div>
        </div>
    `
})
class Positioning {
    readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
    readonly side = signal<SideOrLogical | undefined>(undefined);
    readonly align = signal<Align | undefined>(undefined);
}

describe('Menu contextual placement defaults', () => {
    const setup = async () => {
        TestBed.configureTestingModule({ imports: [Positioning] });
        const fixture = TestBed.createComponent(Positioning);
        await fixture.whenStable();
        const part = (name: string) =>
            fixture.debugElement.query(By.css(`[data-case="${name}"]`)).injector.get(RdxMenuPositioner);
        return { fixture, part };
    };

    it('keeps standalone defaults and uses inline-end/start for a submenu', async () => {
        const { part } = await setup();
        expect([part('plain').side(), part('plain').align()]).toEqual(['bottom', 'center']);
        expect([part('sub').side(), part('sub').align()]).toEqual(['inline-end', 'start']);
    });

    it('tracks the bar orientation on an existing positioner', async () => {
        const { fixture, part } = await setup();
        const positioner = part('bar');
        expect([positioner.side(), positioner.align()]).toEqual(['bottom', 'start']);
        fixture.componentInstance.orientation.set('vertical');
        await fixture.whenStable();
        expect(part('bar')).toBe(positioner);
        expect([positioner.side(), positioner.align()]).toEqual(['inline-end', 'start']);
    });

    it('uses the pointer-anchor offsets only without an explicit side or centered alignment', async () => {
        const { fixture, part } = await setup();
        const positioner = part('context-inputs');
        expect([part('context').side(), part('context').align(), part('context').arrowPadding()]).toEqual([
            'bottom',
            'start',
            0
        ]);
        expect([positioner.sideOffset(), positioner.alignOffset()]).toEqual([-5, 2]);
        fixture.componentInstance.side.set('bottom');
        await fixture.whenStable();
        expect([positioner.sideOffset(), positioner.alignOffset()]).toEqual([0, 0]);
        fixture.componentInstance.side.set(undefined);
        fixture.componentInstance.align.set('center');
        await fixture.whenStable();
        expect([positioner.sideOffset(), positioner.alignOffset()]).toEqual([0, 0]);
        fixture.componentInstance.align.set('end');
        await fixture.whenStable();
        expect([positioner.sideOffset(), positioner.alignOffset()]).toEqual([-5, 2]);
    });
});
