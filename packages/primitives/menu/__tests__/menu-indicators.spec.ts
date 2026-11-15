import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { menuImports } from '../index';

@Component({
    imports: [menuImports],
    template: `
        <div [disabled]="rootDisabled()" rdxMenuRoot>
            <button [(checked)]="checked" [disabled]="itemDisabled()" rdxMenuCheckboxItem>
                <span [keepMounted]="keepMounted()" rdxMenuCheckboxItemIndicator>✓</span>
                Notifications
            </button>
            <div [(value)]="value" [disabled]="groupDisabled()" rdxMenuRadioGroup>
                <button [disabled]="itemDisabled()" value="one" rdxMenuRadioItem>
                    <span [keepMounted]="keepMounted()" rdxMenuRadioItemIndicator>●</span>
                    Small
                </button>
                <button value="two" rdxMenuRadioItem>Large</button>
            </div>
        </div>
    `
})
class Indicators {
    readonly checked = signal<boolean | 'indeterminate'>(false);
    readonly value = signal<string | undefined>(undefined);
    readonly keepMounted = signal(false);
    readonly rootDisabled = signal(false);
    readonly groupDisabled = signal(false);
    readonly itemDisabled = signal(false);
}

describe('Menu indicator contracts', () => {
    let fixture: ComponentFixture<Indicators>;
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [Indicators] });
        fixture = TestBed.createComponent(Indicators);
    });

    for (const kind of ['checkbox', 'radio'] as const) {
        const selector = kind === 'checkbox' ? '[rdxMenuCheckboxItemIndicator]' : '[rdxMenuRadioItemIndicator]';
        const selected = (value: boolean) => {
            if (kind === 'checkbox') fixture.componentInstance.checked.set(value);
            else fixture.componentInstance.value.set(value ? 'one' : 'two');
        };
        const indicator = () => fixture.nativeElement.querySelector(selector) as HTMLElement;

        it(`${kind}: keeps decorative content out of the item name`, async () => {
            selected(true);
            await fixture.whenStable();
            expect(indicator().getAttribute('aria-hidden')).toBe('true');
        });

        it(`${kind}: initial selection and retained deselection have no transition phase`, async () => {
            selected(true);
            await fixture.whenStable();
            expect(indicator().hasAttribute('data-starting-style')).toBe(false);
            fixture.componentInstance.keepMounted.set(true);
            selected(false);
            await fixture.whenStable();
            expect(indicator().style.display).not.toBe('none');
            expect(indicator().hasAttribute('data-unchecked')).toBe(true);
            expect(indicator().hasAttribute('data-ending-style')).toBe(false);
        });

        it(`${kind}: inherits live item and root disabled state`, async () => {
            await fixture.whenStable();
            fixture.componentInstance.itemDisabled.set(true);
            await fixture.whenStable();
            expect(indicator().hasAttribute('data-disabled')).toBe(true);
            fixture.componentInstance.itemDisabled.set(false);
            fixture.componentInstance.rootDisabled.set(true);
            await fixture.whenStable();
            expect(indicator().hasAttribute('data-disabled')).toBe(true);
            fixture.componentInstance.rootDisabled.set(false);
            await fixture.whenStable();
            expect(indicator().hasAttribute('data-disabled')).toBe(false);
        });

        it(`${kind}: waits for the exit and ignores its completion after reselection`, async () => {
            selected(true);
            await fixture.whenStable();
            const node = indicator();
            let finish!: () => void;
            const finished = new Promise<void>((resolve) => (finish = resolve));
            node.style.animationDuration = '30s';
            Object.defineProperty(node, 'getAnimations', { value: () => [{ finished }] });

            selected(false);
            await fixture.whenStable();
            expect(node.hasAttribute('data-ending-style')).toBe(true);
            expect(node.style.display).not.toBe('none');

            selected(true);
            await fixture.whenStable();
            finish();
            await fixture.whenStable();
            expect(node.style.display).not.toBe('none');
            expect(node.hasAttribute('data-ending-style')).toBe(false);
            await new Promise(requestAnimationFrame);
            await fixture.whenStable();
            expect(node.hasAttribute('data-starting-style')).toBe(false);
        });

        it(`${kind}: hides only after the exit completes`, async () => {
            selected(true);
            await fixture.whenStable();
            const node = indicator();
            let finish!: () => void;
            const finished = new Promise<void>((resolve) => (finish = resolve));
            node.style.animationDuration = '30s';
            Object.defineProperty(node, 'getAnimations', { value: () => [{ finished }] });
            selected(false);
            await fixture.whenStable();
            expect(node.style.display).not.toBe('none');
            finish();
            await vi.waitFor(async () => {
                await fixture.whenStable();
                expect(node.style.display).toBe('none');
            });
            expect(node.hasAttribute('data-ending-style')).toBe(false);
        });
    }

    it('radio indicator inherits the group disabled state', async () => {
        fixture.componentInstance.groupDisabled.set(true);
        await fixture.whenStable();
        const indicator = fixture.nativeElement.querySelector('[rdxMenuRadioItemIndicator]');
        expect(indicator.hasAttribute('data-disabled')).toBe(true);
        fixture.componentInstance.groupDisabled.set(false);
        await fixture.whenStable();
        expect(indicator.hasAttribute('data-disabled')).toBe(false);
    });

    it('indeterminate checkbox remains visible without restarting its enter phase', async () => {
        fixture.componentInstance.checked.set(true);
        await fixture.whenStable();
        fixture.componentInstance.checked.set('indeterminate');
        await fixture.whenStable();
        const indicator = fixture.nativeElement.querySelector('[rdxMenuCheckboxItemIndicator]');
        expect(indicator.hasAttribute('data-indeterminate')).toBe(true);
        expect(indicator.hasAttribute('data-starting-style')).toBe(false);
        expect(indicator.style.display).not.toBe('none');
    });
});
