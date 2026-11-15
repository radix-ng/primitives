import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { RdxMenuGroup, RdxMenuGroupLabel, RdxMenuRadioGroup } from '../index';

@Component({
    imports: [RdxMenuGroup, RdxMenuGroupLabel, RdxMenuRadioGroup],
    template: `
        @if (radio()) {
            <div data-testid="group" rdxMenuRadioGroup>
                @if (primary()) {
                    <div [id]="id()" rdxMenuGroupLabel>Planets</div>
                }
                @if (secondary()) {
                    <div id="secondary-label" rdxMenuGroupLabel>Alternative</div>
                }
            </div>
        } @else {
            <div data-testid="group" rdxMenuGroup>
                @if (primary()) {
                    <div [id]="id()" rdxMenuGroupLabel>Planets</div>
                }
                @if (secondary()) {
                    <div id="secondary-label" rdxMenuGroupLabel>Alternative</div>
                }
            </div>
        }
    `
})
class LabelHost {
    readonly radio = signal(false);
    readonly id = signal<string | undefined>('custom-label');
    readonly primary = signal(true);
    readonly secondary = signal(false);
}

describe.each([false, true])('Menu GroupLabel (radio=%s)', (radio) => {
    async function create() {
        const fixture = TestBed.createComponent(LabelHost);
        fixture.componentInstance.radio.set(radio);
        await fixture.whenStable();
        const group = fixture.nativeElement.querySelector('[data-testid="group"]') as HTMLElement;
        const label = () => group.querySelector('[rdxMenuGroupLabel]') as HTMLElement;
        return { fixture, host: fixture.componentInstance, group, label };
    }

    it('[APG Menu][WCAG 4.1.2] preserves authored/reactive ids and names the parent group', async () => {
        const { fixture, host, group, label } = await create();
        expect(label().id).toBe('custom-label');
        expect(label()).toHaveAttribute('aria-hidden', 'true');
        expect(group).toHaveAttribute('aria-labelledby', 'custom-label');
        expect(group).toHaveAccessibleName('Planets');
        host.id.set('renamed-label');
        await fixture.whenStable();
        expect(label().id).toBe('renamed-label');
        expect(group).toHaveAttribute('aria-labelledby', 'renamed-label');
        expect(group).toHaveAccessibleName('Planets');
        expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        fixture.destroy();
    });

    it('keeps a stable generated fallback when the authored id is removed', async () => {
        const { fixture, host, group, label } = await create();
        host.id.set(undefined);
        await fixture.whenStable();
        const generated = label().id;
        expect(generated).toMatch(/^rdx-menu-group-label-/);
        expect(group.getAttribute('aria-labelledby')).toBe(generated);
        host.id.set('temporary-id');
        await fixture.whenStable();
        expect(group.getAttribute('aria-labelledby')).toBe('temporary-id');
        host.id.set(undefined);
        await fixture.whenStable();
        expect(label().id).toBe(generated);
        expect(group.getAttribute('aria-labelledby')).toBe(generated);
        fixture.destroy();
    });

    it('clears removed associations and registers the replacement label', async () => {
        const { fixture, host, group } = await create();
        host.primary.set(false);
        await fixture.whenStable();
        expect(group).not.toHaveAttribute('aria-labelledby');
        host.id.set('replacement-label');
        host.primary.set(true);
        await fixture.whenStable();
        expect(group).toHaveAttribute('aria-labelledby', 'replacement-label');
        fixture.destroy();
    });

    it('does not clear a newer label when an older label is destroyed', async () => {
        const { fixture, host, group } = await create();
        host.secondary.set(true);
        await fixture.whenStable();
        expect(group).toHaveAttribute('aria-labelledby', 'secondary-label');
        host.primary.set(false);
        await fixture.whenStable();
        expect(group).toHaveAttribute('aria-labelledby', 'secondary-label');
        expect(group).toHaveAccessibleName('Alternative');
        fixture.destroy();
    });
});
