import { _importsCombobox } from '../index';
import { RdxComboboxRoot } from '../src/combobox-root';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Characterization tests (ADR 0014, Phase 0): pin the engine's keyboard-navigation edges before the
 * shared-engine extraction moves this logic. These behaviors are correct today and must survive P1.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div rdxComboboxRoot [loopFocus]="loop()" [(value)]="value" [(open)]="open">
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div rdxComboboxItem [value]="fruit">{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class HostComponent {
    readonly value = signal<string | null>(null);
    readonly open = signal(false);
    readonly loop = signal(true);
    readonly fruits = ['apple', 'banana', 'grape'];
}

describe('Combobox keyboard navigation edges', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    function root(): RdxComboboxRoot {
        return fixture.debugElement.query(By.directive(RdxComboboxRoot)).injector.get(RdxComboboxRoot);
    }
    function inputEl(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }
    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }
    function key(k: string): void {
        inputEl().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await settle();
    });

    it('ArrowUp from the closed state opens the popup and highlights the last item', async () => {
        key('ArrowUp');
        await settle();
        expect(host.open()).toBe(true);
        expect(root().highlightedItem()?.value()).toBe('grape');
    });

    it('ArrowDown from the closed state opens the popup and highlights the first item', async () => {
        key('ArrowDown');
        await settle();
        expect(host.open()).toBe(true);
        expect(root().highlightedItem()?.value()).toBe('apple');
    });

    it('does not wrap past the last item on ArrowDown when loopFocus is false', async () => {
        host.loop.set(false);
        host.open.set(true);
        await settle();
        key('ArrowDown'); // apple
        await settle();
        key('ArrowDown'); // banana
        await settle();
        key('ArrowDown'); // grape (last)
        await settle();
        key('ArrowDown'); // stays grape — no wrap
        await settle();
        expect(root().highlightedItem()?.value()).toBe('grape');
    });

    it('does not wrap past the first item on ArrowUp when loopFocus is false', async () => {
        host.loop.set(false);
        host.open.set(true);
        await settle();
        key('ArrowDown'); // apple (first)
        await settle();
        key('ArrowUp'); // stays apple — no wrap
        await settle();
        expect(root().highlightedItem()?.value()).toBe('apple');
    });
});
