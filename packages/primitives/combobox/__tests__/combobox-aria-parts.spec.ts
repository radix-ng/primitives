import { _importsCombobox } from '../index';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * ARIA / part-parity regressions (ADR 0014 review batch 2): list is a programmatic focus target that
 * selects on Enter (#1), the group label clears its registration on unmount (#5), the backdrop is
 * `role="presentation"` (#6), and the arrow is `aria-hidden` (#7).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div modal rdxComboboxRoot [readOnly]="readOnly()" [(value)]="value" [(open)]="open">
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxBackdrop></div>
                <div rdxComboboxPopup>
                    <div rdxComboboxArrow></div>
                    <div rdxComboboxList aria-label="Fruits">
                        <div rdxComboboxGroup>
                            @if (showLabel()) {
                                <div rdxComboboxGroupLabel>Fruits</div>
                            }
                            <div rdxComboboxItem [value]="'apple'">apple</div>
                            <div rdxComboboxItem [value]="'banana'">banana</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<string | null>(null);
    readonly open = signal(true);
    readonly showLabel = signal(true);
    readonly readOnly = signal(false);
}

describe('Combobox ARIA part parity', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function el(sel: string): HTMLElement {
        return document.querySelector(sel) as HTMLElement;
    }
    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    it('list is a focus target (tabindex=-1) and the arrow is aria-hidden', () => {
        expect(el('[rdxComboboxList]').getAttribute('tabindex')).toBe('-1');
        expect(el('[rdxComboboxArrow]').getAttribute('aria-hidden')).toBe('true');
    });

    it('backdrop is role="presentation" (not aria-hidden)', () => {
        const backdrop = el('[rdxComboboxBackdrop]');
        expect(backdrop.getAttribute('role')).toBe('presentation');
        expect(backdrop.hasAttribute('aria-hidden')).toBe(false);
    });

    it('Enter on the focused list selects the highlighted item', async () => {
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle();
        el('[rdxComboboxList]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await settle();
        expect(host.value()).toBe('apple');
    });

    it('Enter selection on the list stops propagation (parents do not re-handle it)', async () => {
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle();
        let reachedDocument = 0;
        const onDoc = (): void => {
            reachedDocument++;
        };
        document.addEventListener('keydown', onDoc);
        el('[rdxComboboxList]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        document.removeEventListener('keydown', onDoc);
        await settle();
        expect(host.value()).toBe('apple');
        expect(reachedDocument).toBe(0); // stopPropagation kept Enter from bubbling to the document
    });

    it('focusing the list hands focus back to the input (Base UI focus handoff)', async () => {
        el('[rdxComboboxList]').focus();
        await settle();
        expect(document.activeElement).toBe(input());
    });

    it('Enter on the list neither selects nor swallows the key when read-only', async () => {
        host.readOnly.set(true);
        await settle();
        // Read-only still allows navigation, so a highlight exists — but Enter must not select…
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await settle();
        const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        el('[rdxComboboxList]').dispatchEvent(ev);
        await settle();
        expect(host.value()).toBeNull();
        // …and must not swallow Enter (Base UI bails early; a form submit would still proceed).
        expect(ev.defaultPrevented).toBe(false);
    });

    it('group references the label, and clears the reference when the label is removed', async () => {
        const group = el('[rdxComboboxGroup]');
        const labelId = el('[rdxComboboxGroupLabel]').getAttribute('id');
        expect(group.getAttribute('aria-labelledby')).toBe(labelId);

        host.showLabel.set(false);
        await settle();
        expect(group.hasAttribute('aria-labelledby')).toBe(false);
    });
});
