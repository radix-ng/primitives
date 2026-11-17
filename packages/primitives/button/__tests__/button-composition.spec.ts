import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { RdxToolbarButton, RdxToolbarGroup, RdxToolbarRoot } from '@radix-ng/primitives/toolbar';
import { RdxButtonDirective } from '../src/button.directive';

@Component({
    imports: [RdxButtonDirective],
    template: `
        <span
            (keydown)="consume($event)"
            (keyup)="consume($event)"
            (click)="events.push('click')"
            rdxButton
            tabindex="0"
        >
            Action
        </span>
    `
})
class ConsumerHost {
    readonly cancel = signal<string | null>(null);
    readonly events: string[] = [];
    consume(event: KeyboardEvent) {
        this.events.push(event.type);
        if (this.cancel() === event.type) event.preventDefault();
    }
}

function key(element: HTMLElement, type: string, value: string) {
    const event = new KeyboardEvent(type, { key: value, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return event;
}

describe('Button consumer keyboard handlers', () => {
    for (const [type, value] of [
        ['keydown', 'Enter'],
        ['keyup', ' ']
    ]) {
        it(`lets template ${type} cancel ${value === ' ' ? 'Space' : 'Enter'}`, () => {
            const fixture = TestBed.createComponent(ConsumerHost);
            fixture.componentInstance.cancel.set(type);
            fixture.detectChanges();
            const element = fixture.nativeElement.querySelector('span');
            key(element, type, value);
            expect(fixture.componentInstance.events).toEqual([type]);
        });
        it(`lets a later native ${type} listener cancel activation`, () => {
            const fixture = TestBed.createComponent(ConsumerHost);
            fixture.detectChanges();
            const element: HTMLElement = fixture.nativeElement.querySelector('span');
            element.addEventListener(type, (event) => event.preventDefault());
            key(element, type, value);
            expect(fixture.componentInstance.events).toEqual([type]);
        });
    }
    it('runs the template handler before one synchronous activation for every repeat', () => {
        const fixture = TestBed.createComponent(ConsumerHost);
        fixture.detectChanges();
        const element = fixture.nativeElement.querySelector('span');
        key(element, 'keydown', 'Enter');
        key(element, 'keydown', 'Enter');
        key(element, 'keydown', 'Enter');
        expect(fixture.componentInstance.events).toEqual(['keydown', 'click', 'keydown', 'click', 'keydown', 'click']);
    });
    it('keeps same-host activation when a consumer stops propagation', () => {
        const fixture = TestBed.createComponent(ConsumerHost);
        fixture.detectChanges();
        const element: HTMLElement = fixture.nativeElement.querySelector('span');
        element.addEventListener('keydown', (event) => event.stopPropagation());
        key(element, 'keydown', 'Enter');
        expect(fixture.componentInstance.events).toEqual(['keydown', 'click']);
    });
});

@Component({
    imports: [
        RdxButtonDirective,
        RdxCompositeRoot,
        RdxCompositeItem,
        RdxToolbarRoot,
        RdxToolbarGroup,
        RdxToolbarButton
    ],
    template: `
        <div rdxCompositeRoot>
            <button rdxCompositeItem rdxButton>First</button>
            <!-- rdxButton supplies focusability and keyboard activation. -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <span (click)="clicks = clicks + 1" rdxCompositeItem rdxButton data-testid="composite">Action</span>
        </div>
        <div [disabled]="rootDisabled()" rdxToolbarRoot>
            <button rdxToolbarButton>First</button>
            <div [disabled]="groupDisabled()" rdxToolbarGroup>
                <button (click)="clicks = clicks + 1" rdxToolbarButton rdxButton data-testid="toolbar">Action</button>
            </div>
        </div>
    `
})
class CompositeHost {
    readonly groupDisabled = signal(false);
    readonly rootDisabled = signal(false);
    clicks = 0;
}

describe('Button composite and Toolbar ownership', () => {
    it('retains the composite item roving tabindex', async () => {
        const fixture = TestBed.createComponent(CompositeHost);
        fixture.detectChanges();
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement.querySelector('[data-testid="composite"]');
        const toolbar: HTMLElement = fixture.nativeElement.querySelector('[data-testid="toolbar"]');
        expect(element.tabIndex).toBe(-1);
        expect(toolbar.tabIndex).toBe(-1);
        element.focus();
        await fixture.whenStable();
        expect(element.tabIndex).toBe(0);
    });
    it('activates composite Space on keydown and suppresses the keyup duplicate', () => {
        const fixture = TestBed.createComponent(CompositeHost);
        fixture.detectChanges();
        const element = fixture.nativeElement.querySelector('[data-testid="composite"]');
        key(element, 'keydown', ' ');
        expect(fixture.componentInstance.clicks).toBe(1);
        key(element, 'keyup', ' ');
        expect(fixture.componentInstance.clicks).toBe(1);
    });
    for (const owner of ['groupDisabled', 'rootDisabled'] as const) {
        it(`inherits ${owner} without losing native focusability`, async () => {
            const fixture = TestBed.createComponent(CompositeHost);
            fixture.componentInstance[owner].set(true);
            fixture.detectChanges();
            await fixture.whenStable();
            const element: HTMLElement = fixture.nativeElement.querySelector('[data-testid="toolbar"]');
            expect(element.getAttribute('aria-disabled')).toBe('true');
            expect(element.hasAttribute('disabled')).toBe(false);
            element.click();
            key(element, 'keydown', ' ');
            key(element, 'keyup', ' ');
            expect(fixture.componentInstance.clicks).toBe(0);
            fixture.componentInstance[owner].set(false);
            await fixture.whenStable();
            expect(element.hasAttribute('aria-disabled')).toBe(false);
            element.click();
            expect(fixture.componentInstance.clicks).toBe(1);
        });
    }
});
