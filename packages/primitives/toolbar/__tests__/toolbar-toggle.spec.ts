import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxToggle, RdxTogglePressedChangeEvent } from '@radix-ng/primitives/toggle';
import { RdxToolbarButton } from '../src/toolbar-button';
import { RdxToolbarRoot } from '../src/toolbar-root';

@Component({
    imports: [RdxToggle, RdxToolbarButton, RdxToolbarRoot],
    template: `
        <div rdxToolbarRoot>
            <!-- The composed directives supply focus and roving tabindex. -->
            <!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus -->
            <span
                #toggle="rdxToggle"
                [nativeButton]="false"
                (onPressedChange)="change($event)"
                (click)="clicks = clicks + 1"
                (keydown)="consume($event)"
                rdxToggle
                rdxToolbarButton
                data-testid="subject"
            >
                Bold
            </span>
            <output>{{ toggle.pressedState() }}</output>
        </div>
    `
})
class ToolbarToggleHost {
    readonly changes: boolean[] = [];
    readonly eventTypes: string[] = [];
    clicks = 0;
    cancelChange = false;
    preventEnter = false;
    consume(event: KeyboardEvent) {
        if (this.preventEnter && event.key === 'Enter') event.preventDefault();
    }
    change(event: RdxTogglePressedChangeEvent) {
        this.changes.push(event.pressed);
        this.eventTypes.push(event.eventDetails.event.type);
        if (this.cancelChange) event.eventDetails.cancel();
    }
}

describe('Toolbar Toggle keyboard activation', () => {
    it('routes Enter through one click event before changing pressed', () => {
        const fixture = TestBed.createComponent(ToolbarToggleHost);
        fixture.detectChanges();
        const target: HTMLElement = fixture.nativeElement.querySelector('[data-testid="subject"]');
        target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        expect(fixture.componentInstance.changes).toEqual([true]);
        expect(fixture.componentInstance.eventTypes).toEqual(['click']);
        expect(fixture.componentInstance.clicks).toBe(1);
    });
    it('honors a consumer-prevented Enter keydown', () => {
        const fixture = TestBed.createComponent(ToolbarToggleHost);
        fixture.componentInstance.preventEnter = true;
        fixture.detectChanges();
        const target: HTMLElement = fixture.nativeElement.querySelector('[data-testid="subject"]');
        target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        expect(fixture.componentInstance.changes).toEqual([]);
        expect(fixture.componentInstance.clicks).toBe(0);
    });
    it('does not commit or repeat a canceled pressed change on Space keyup', () => {
        const fixture = TestBed.createComponent(ToolbarToggleHost);
        fixture.componentInstance.cancelChange = true;
        fixture.detectChanges();
        const target: HTMLElement = fixture.nativeElement.querySelector('[data-testid="subject"]');
        for (const type of ['keydown', 'keyup'])
            target.dispatchEvent(new KeyboardEvent(type, { key: ' ', bubbles: true, cancelable: true }));
        fixture.detectChanges();
        expect(fixture.componentInstance.changes).toEqual([true]);
        expect(fixture.componentInstance.eventTypes).toEqual(['click']);
        expect(target.getAttribute('aria-pressed')).toBe('false');
    });
    it('changes pressed once on Space keydown and keeps the state on keyup', () => {
        const fixture = TestBed.createComponent(ToolbarToggleHost);
        fixture.detectChanges();
        const target: HTMLElement = fixture.nativeElement.querySelector('[data-testid="subject"]');
        target.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
        expect(fixture.componentInstance.changes).toEqual([true]);
        target.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
        expect(fixture.componentInstance.changes).toEqual([true]);
        fixture.detectChanges();
        expect(target.getAttribute('aria-pressed')).toBe('true');
    });
});
