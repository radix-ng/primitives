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

@Component({
    imports: [RdxButtonDirective],
    template: `
        <!-- rdxButton supplies keyboard handling and focusability. -->
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <div (click)="clicks.push($event)" rdxButton data-testid="custom">
            Action
            <span tabindex="0" data-testid="child">Child</span>
        </div>
        <a (click)="clicks.push($event)" rdxButton href="#target">Link</a>
    `
})
class KeyboardHost {
    readonly clicks: MouseEvent[] = [];
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
            expect(el.getAttribute('tabindex')).toBe('0');
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

        it('prevents a disabled pointer press from moving focus', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();
            const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
            el.dispatchEvent(event);
            expect(event.defaultPrevented).toBe(true);
        });

        it('keeps Tab defaults while suppressing other keys on a focusable disabled button', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.componentRef.setInput('focusableWhenDisabled', true);
            fixture.detectChanges();
            for (const key of ['Tab', 'ArrowDown', 'Enter', ' ']) {
                const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
                el.dispatchEvent(event);
                expect(event.defaultPrevented).toBe(key !== 'Tab');
            }
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

        it('activates on Space keyup without activating on keydown', () => {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
            expect(component.clicks).toBe(0);
            el.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
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

    describe('keyboard event ownership', () => {
        let fixture: ComponentFixture<KeyboardHost>;
        let custom: HTMLElement;
        let link: HTMLAnchorElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(KeyboardHost);
            fixture.detectChanges();
            custom = fixture.nativeElement.querySelector('[data-testid="custom"]');
            link = fixture.nativeElement.querySelector('a');
        });

        it('[APG Button][WCAG 2.1.1] preserves modifiers on synthesized Enter and Space clicks', () => {
            custom.dispatchEvent(
                new KeyboardEvent('keydown', {
                    key: 'Enter',
                    bubbles: true,
                    cancelable: true,
                    ctrlKey: true,
                    shiftKey: true
                })
            );
            custom.dispatchEvent(
                new KeyboardEvent('keyup', {
                    key: ' ',
                    bubbles: true,
                    cancelable: true,
                    altKey: true,
                    metaKey: true
                })
            );
            expect(fixture.componentInstance.clicks).toEqual([
                expect.objectContaining({ ctrlKey: true, shiftKey: true, detail: 0 }),
                expect.objectContaining({ altKey: true, metaKey: true, detail: 0 })
            ]);
        });

        it('respects a prevented Enter keydown and Space keyup', () => {
            for (const [type, key] of [
                ['keydown', 'Enter'],
                ['keyup', ' ']
            ]) {
                const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true });
                event.preventDefault();
                custom.dispatchEvent(event);
            }
            expect(fixture.componentInstance.clicks).toEqual([]);
        });

        it('[APG Button][WCAG 2.1.1] leaves descendant keyboard events to the descendant', () => {
            const child = custom.querySelector('[data-testid="child"]')!;
            for (const type of ['keydown', 'keyup']) {
                for (const key of ['Enter', ' ']) {
                    const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true });
                    child.dispatchEvent(event);
                    expect(event.defaultPrevented).toBe(false);
                }
            }
            expect(fixture.componentInstance.clicks).toEqual([]);
        });

        it('leaves a valid link Enter to native activation', () => {
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
            link.dispatchEvent(event);
            expect(event.defaultPrevented).toBe(false);
            expect(fixture.componentInstance.clicks).toEqual([]);
        });

        it('prevents link Space scrolling and activates on keyup', () => {
            const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
            link.dispatchEvent(event);
            expect(event.defaultPrevented).toBe(true);
            expect(fixture.componentInstance.clicks).toEqual([]);
            link.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
            expect(fixture.componentInstance.clicks).toHaveLength(1);
        });

        it('removes both keyboard listeners when destroyed', () => {
            fixture.destroy();
            const clicks = vi.fn();
            custom.addEventListener('click', clicks);
            custom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
            custom.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }));
            expect(clicks).not.toHaveBeenCalled();
        });
    });
});
