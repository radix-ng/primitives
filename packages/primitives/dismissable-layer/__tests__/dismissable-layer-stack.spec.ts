import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RdxDismissableLayer } from '../src/dismissable-layer';

@Component({
    imports: [RdxDismissableLayer],
    template: `
        @if (showA()) {
            <div [disableOutsidePointerEvents]="disableA()" (dismiss)="onDismissA()" rdxDismissableLayer>Layer A</div>
        }
        @if (showB()) {
            <div [disableOutsidePointerEvents]="disableB()" (dismiss)="onDismissB()" rdxDismissableLayer>Layer B</div>
        }
    `
})
class StackHost {
    readonly showA = signal(true);
    readonly showB = signal(true);
    readonly disableA = signal(false);
    readonly disableB = signal(false);

    readonly onDismissA = jest.fn();
    readonly onDismissB = jest.fn();
}

function pressEscape(): void {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

describe('RdxDismissableLayer — stack', () => {
    let fixture: ComponentFixture<StackHost>;
    let host: StackHost;

    beforeEach(() => {
        document.body.style.pointerEvents = '';
        fixture = TestBed.createComponent(StackHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        document.body.style.pointerEvents = '';
    });

    describe('Escape', () => {
        it('dismisses only the topmost layer', () => {
            pressEscape();

            expect(host.onDismissB).toHaveBeenCalledTimes(1);
            expect(host.onDismissA).not.toHaveBeenCalled();
        });

        it('dismisses the new top layer after the previous top is removed', () => {
            // simulate the consumer closing B in response to its dismiss
            host.showB.set(false);
            fixture.detectChanges();

            pressEscape();

            expect(host.onDismissA).toHaveBeenCalledTimes(1);
        });

        it('dismisses the single remaining layer', () => {
            host.showB.set(false);
            fixture.detectChanges();

            pressEscape();
            expect(host.onDismissA).toHaveBeenCalledTimes(1);
            expect(host.onDismissB).not.toHaveBeenCalled();
        });
    });

    describe('body pointer-events', () => {
        it('disables body pointer-events while any layer disables outside pointer events', () => {
            expect(document.body.style.pointerEvents).toBe('');

            host.disableA.set(true);
            host.disableB.set(true);
            fixture.detectChanges();

            expect(document.body.style.pointerEvents).toBe('none');
        });

        it('keeps the original value (no "none" leak) once all layers are gone', () => {
            host.disableA.set(true);
            host.disableB.set(true);
            fixture.detectChanges();
            expect(document.body.style.pointerEvents).toBe('none');

            // remove the top layer first — body must stay disabled
            host.showB.set(false);
            fixture.detectChanges();
            expect(document.body.style.pointerEvents).toBe('none');

            // remove the last layer — body is restored to the original (empty) value, not "none"
            host.showA.set(false);
            fixture.detectChanges();
            expect(document.body.style.pointerEvents).toBe('');
        });

        it('restores the original value when both layers unmount together', () => {
            host.disableA.set(true);
            host.disableB.set(true);
            fixture.detectChanges();
            expect(document.body.style.pointerEvents).toBe('none');

            host.showA.set(false);
            host.showB.set(false);
            fixture.detectChanges();

            expect(document.body.style.pointerEvents).toBe('');
        });
    });
});
