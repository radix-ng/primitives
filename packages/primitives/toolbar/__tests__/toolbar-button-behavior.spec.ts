import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import { RdxMenuRoot, RdxMenuTrigger } from '@radix-ng/primitives/menu';
import { RdxToolbarButton } from '../src/toolbar-button';
import { RdxToolbarRoot } from '../src/toolbar-root';

@Component({
    imports: [RdxToolbarRoot, RdxToolbarButton, RdxButtonDirective],
    template: `
        <div rdxToolbarRoot>
            <!-- The directives supply focus and keyboard activation. -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <span [nativeButton]="false" (click)="clicks = clicks + 1" rdxToolbarButton data-testid="bare">Bare</span>
            <!-- The directives supply focus and keyboard activation. -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <span [nativeButton]="false" (click)="clicks = clicks + 1" rdxToolbarButton rdxButton data-testid="stacked">
                Stacked
            </span>
        </div>
    `
})
class ToolbarHost {
    clicks = 0;
}

describe('Toolbar button behavior', () => {
    for (const selector of ['bare', 'stacked']) {
        it(`activates ${selector} custom hosts once per Enter/Space keydown`, () => {
            const fixture = TestBed.createComponent(ToolbarHost);
            fixture.detectChanges();
            const target: HTMLElement = fixture.nativeElement.querySelector(`[data-testid="${selector}"]`);
            for (const key of ['Enter', ' ']) {
                const count = fixture.componentInstance.clicks;
                target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
                expect(fixture.componentInstance.clicks).toBe(count + 1);
                target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true }));
                expect(fixture.componentInstance.clicks).toBe(count + 1);
            }
        });
    }
    it('removes keyboard synthesis when the host is destroyed', () => {
        const fixture = TestBed.createComponent(ToolbarHost);
        fixture.detectChanges();
        const target: HTMLElement = fixture.nativeElement.querySelector('[data-testid="bare"]');
        fixture.destroy();
        const click = vi.fn();
        target.addEventListener('click', click);
        target.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
        expect(click).not.toHaveBeenCalled();
    });
});

@Component({
    imports: [RdxToolbarRoot, RdxToolbarButton, RdxMenuRoot, RdxMenuTrigger],
    template: `
        <div rdxToolbarRoot>
            <ng-container rdxMenuRoot>
                @if (native()) {
                    <button rdxToolbarButton rdxMenuTrigger>Menu</button>
                } @else {
                    <span [nativeButton]="false" rdxToolbarButton rdxMenuTrigger>Menu</span>
                }
            </ng-container>
        </div>
    `
})
class ToolbarMenuHost {
    readonly native = signal(false);
    readonly menu = viewChild.required(RdxMenuRoot);
}

describe('Toolbar button trigger composition', () => {
    for (const native of [false, true]) {
        it(`opens a ${native ? 'native' : 'custom'} Menu trigger once for composite Space`, () => {
            const fixture = TestBed.createComponent(ToolbarMenuHost);
            fixture.componentInstance.native.set(native);
            fixture.detectChanges();
            const root = fixture.componentInstance.menu();
            const target: HTMLElement = fixture.nativeElement.querySelector(native ? 'button' : 'span');
            target.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
            fixture.detectChanges();
            expect(root.open()).toBe(true);
            target.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
            fixture.detectChanges();
            expect(root.open()).toBe(true);
        });
    }
});
