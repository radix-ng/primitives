import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { menuImports, RdxMenuRadioGroup, RdxMenuRoot } from '../index';

@Component({
    selector: 'wrapped-menu',
    hostDirectives: [{ directive: RdxMenuRoot, inputs: ['open', 'defaultOpen'] }],
    template: ''
})
class WrappedMenu {}

@Component({
    imports: [menuImports, WrappedMenu],
    template: `
        <div [open]="open()" [defaultOpen]="defaultOpen()" rdxMenuRoot>
            <div [open]="open()" [defaultOpen]="defaultOpen()" rdxMenuRoot></div>
        </div>
        <div [defaultOpen]="lateOpen()" rdxMenuRoot></div>
        <div [value]="value()" [defaultValue]="defaultValue()" rdxMenuRadioGroup></div>
        <div [defaultValue]="lateValue()" rdxMenuRadioGroup></div>
        <wrapped-menu [open]="open()" [defaultOpen]="defaultOpen()" />
    `
})
class DefaultsHost {
    readonly open = signal(false);
    readonly defaultOpen = signal(true);
    readonly lateOpen = signal(false);
    readonly value = signal<unknown>('explicit');
    readonly defaultValue = signal<unknown>('default');
    readonly lateValue = signal<unknown>(undefined);
    readonly root = viewChild.required(RdxMenuRoot);
}

describe('Menu initial model/default precedence', () => {
    const setup = async () => {
        TestBed.configureTestingModule({ imports: [DefaultsHost] });
        const fixture = TestBed.createComponent(DefaultsHost);
        await fixture.whenStable();
        return {
            fixture,
            roots: fixture.debugElement.children.slice(0, 2).map((element) => element.injector.get(RdxMenuRoot)),
            outer: fixture.componentInstance.root(),
            child: fixture.debugElement.children[0].children[0].injector.get(RdxMenuRoot),
            group: fixture.debugElement.children[2].injector.get(RdxMenuRadioGroup),
            lateGroup: fixture.debugElement.children[3].injector.get(RdxMenuRadioGroup)
        };
    };

    it('keeps an explicit false open model on root and nested root', async () => {
        const { outer, child } = await setup();
        expect(outer.open()).toBe(false);
        expect(child.open()).toBe(false);
    });

    it('ignores a late defaultOpen even when the initial default was false', async () => {
        const { fixture, roots } = await setup();
        fixture.componentInstance.lateOpen.set(true);
        await fixture.whenStable();
        expect(roots[1].open()).toBe(false);
    });

    it('preserves explicit false through a hostDirectives wrapper', async () => {
        const { fixture } = await setup();
        expect(fixture.debugElement.children[4].injector.get(RdxMenuRoot).open()).toBe(false);
    });

    it('keeps an initially true model and accepts subsequent parent model writes', async () => {
        TestBed.configureTestingModule({ imports: [DefaultsHost] });
        const fixture = TestBed.createComponent(DefaultsHost);
        fixture.componentInstance.open.set(true);
        fixture.componentInstance.defaultOpen.set(false);
        await fixture.whenStable();
        expect(fixture.componentInstance.root().open()).toBe(true);
        fixture.componentInstance.open.set(false);
        fixture.componentInstance.defaultOpen.set(true);
        await fixture.whenStable();
        expect(fixture.componentInstance.root().open()).toBe(false);
    });

    it('does not reopen after an initial defaultOpen has been closed', async () => {
        TestBed.configureTestingModule({ imports: [DefaultsHost] });
        const fixture = TestBed.createComponent(DefaultsHost);
        fixture.componentInstance.lateOpen.set(true);
        await fixture.whenStable();
        const root = fixture.debugElement.children[1].injector.get(RdxMenuRoot);
        expect(root.open()).toBe(true);
        root.open.set(false);
        fixture.componentInstance.lateOpen.set(false);
        await fixture.whenStable();
        fixture.componentInstance.lateOpen.set(true);
        await fixture.whenStable();
        expect(root.open()).toBe(false);
    });

    it.each(['explicit', null, false, 0])('keeps an explicit radio value %s over its default', async (value) => {
        TestBed.configureTestingModule({ imports: [DefaultsHost] });
        const fixture = TestBed.createComponent(DefaultsHost);
        fixture.componentInstance.value.set(value);
        await fixture.whenStable();
        expect(fixture.debugElement.children[2].injector.get(RdxMenuRadioGroup).value()).toBe(value);
    });

    it('ignores late defaults before and after a radio selection', async () => {
        const { fixture, lateGroup } = await setup();
        fixture.componentInstance.lateValue.set('late');
        await fixture.whenStable();
        expect(lateGroup.value()).toBeUndefined();
        lateGroup.selectValue('chosen');
        fixture.componentInstance.lateValue.set('later');
        await fixture.whenStable();
        expect(lateGroup.value()).toBe('chosen');
    });

    it('uses an initial default when the radio model is explicitly undefined', async () => {
        TestBed.configureTestingModule({ imports: [DefaultsHost] });
        const fixture = TestBed.createComponent(DefaultsHost);
        fixture.componentInstance.value.set(undefined);
        await fixture.whenStable();
        expect(fixture.debugElement.children[2].injector.get(RdxMenuRadioGroup).value()).toBe('default');
    });
});
