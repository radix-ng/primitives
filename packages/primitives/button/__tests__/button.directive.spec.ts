import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxButtonDirective } from '../src/button.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxButtonDirective],
    template: `
        <button
            [disabled]="disabled"
            [focusableWhenDisabled]="focusableWhenDisabled"
            [type]="type"
            (click)="onClick()"
            rdxButton
        >
            Button
        </button>
    `
})
class NativeButtonHost {
    @Input() disabled = false;
    @Input() focusableWhenDisabled = false;
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    clicks = 0;
    onClick(): void {
        this.clicks++;
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RdxButtonDirective],
    template: `
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
        <a [disabled]="disabled" (click)="onClick()" rdxButton>Link</a>
    `
})
class AnchorHost {
    @Input() disabled = false;
    clicks = 0;
    onClick(): void {
        this.clicks++;
    }
}

describe('RdxButtonDirective', () => {
    describe('native button host', () => {
        let fixture: ComponentFixture<NativeButtonHost>;
        let component: NativeButtonHost;
        let el: HTMLButtonElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(NativeButtonHost);
            component = fixture.componentInstance;
            el = fixture.debugElement.query(By.css('button')).nativeElement;
            fixture.detectChanges();
        });

        it('defaults type to "button" and sets no disabled attributes', () => {
            expect(el.getAttribute('type')).toBe('button');
            expect(el.hasAttribute('data-disabled')).toBe(false);
            expect(el.hasAttribute('disabled')).toBe(false);
            expect(el.hasAttribute('aria-disabled')).toBe(false);
        });

        it('passes through the type input', () => {
            component.type = 'submit';
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            expect(el.getAttribute('type')).toBe('submit');
        });

        it('uses native disabled (not aria-disabled) when disabled', () => {
            component.disabled = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            expect(el.getAttribute('data-disabled')).toBe('');
            expect(el.hasAttribute('disabled')).toBe(true);
            expect(el.hasAttribute('aria-disabled')).toBe(false);
        });

        it('uses aria-disabled and stays focusable with focusableWhenDisabled', () => {
            component.disabled = true;
            component.focusableWhenDisabled = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            expect(el.getAttribute('data-disabled')).toBe('');
            expect(el.hasAttribute('disabled')).toBe(false);
            expect(el.getAttribute('aria-disabled')).toBe('true');
        });

        it('suppresses click activation when disabled (focusableWhenDisabled)', () => {
            component.disabled = true;
            component.focusableWhenDisabled = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            el.click();
            expect(component.clicks).toBe(0);
        });

        it('clicks normally when enabled', () => {
            el.click();
            expect(component.clicks).toBe(1);
        });
    });

    describe('non-button host', () => {
        let fixture: ComponentFixture<AnchorHost>;
        let component: AnchorHost;
        let el: HTMLAnchorElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(AnchorHost);
            component = fixture.componentInstance;
            el = fixture.debugElement.query(By.css('a')).nativeElement;
            fixture.detectChanges();
        });

        it('adds button semantics', () => {
            expect(el.getAttribute('role')).toBe('button');
            expect(el.getAttribute('tabindex')).toBe('0');
            expect(el.hasAttribute('type')).toBe(false);
        });

        it('activates on Enter', () => {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            expect(component.clicks).toBe(1);
        });

        it('activates on Space', () => {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
            expect(component.clicks).toBe(1);
        });

        it('uses aria-disabled and tabindex -1 when disabled', () => {
            component.disabled = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            expect(el.getAttribute('aria-disabled')).toBe('true');
            expect(el.getAttribute('tabindex')).toBe('-1');
            expect(el.hasAttribute('disabled')).toBe(false);
        });

        it('does not activate on Enter when disabled', () => {
            component.disabled = true;
            fixture.changeDetectorRef.markForCheck();
            fixture.detectChanges();
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            expect(component.clicks).toBe(0);
        });
    });
});
