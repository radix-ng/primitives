import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxPopperContentWrapper } from '@radix-ng/primitives/popper';
import {
    createRdxTooltipHandle,
    RdxTooltip,
    RdxTooltipPopup,
    RdxTooltipPositioner,
    RdxTooltipProvider,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';
import { vi } from 'vitest';
import { defaultTooltipConfig, injectRdxTooltipConfig, provideRdxTooltipConfig } from '../src/tooltip.config';

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger],
    template: `
        <ng-container
            #root="rdxTooltip"
            [(open)]="open"
            [disabled]="disabled"
            [delay]="delay"
            [closeDelay]="closeDelay"
            [disableHoverablePopup]="disableHoverablePopup"
            (onOpenChange)="changes.push($event)"
            rdxTooltip
        >
            <button [closeOnClick]="closeOnClick" rdxTooltipTrigger>Trigger</button>
        </ng-container>
    `
})
class TestHostComponent {
    open = false;
    disabled = false;
    delay = 600;
    closeDelay = 0;
    disableHoverablePopup = false;
    closeOnClick = true;
    changes: boolean[] = [];
}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger],
    providers: [provideRdxTooltipConfig({ delay: 1234, closeDelay: 50 })],
    template: `
        <ng-container rdxTooltip>
            <button rdxTooltipTrigger>Trigger</button>
        </ng-container>
    `
})
class ConfiguredHostComponent {}

@Component({
    imports: [RdxTooltip, RdxTooltipProvider, RdxTooltipTrigger],
    template: `
        <div [delay]="500" rdxTooltipProvider>
            <ng-container rdxTooltip>
                <button rdxTooltipTrigger>Trigger</button>
            </ng-container>
        </div>
    `
})
class ProviderHostComponent {}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger],
    template: `
        <div [delay]="0" rdxTooltip>
            <button id="trigger-a" rdxTooltipTrigger>A</button>
            <button id="trigger-b" rdxTooltipTrigger>B</button>
        </div>
    `
})
class MultipleTriggersHostComponent {}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger],
    template: `
        <div [delay]="600" rdxTooltip>
            <button [delay]="50" rdxTooltipTrigger>Trigger</button>
        </div>
    `
})
class TriggerDelayHostComponent {}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger],
    template: `
        <div [delay]="0" rdxTooltip>
            <button disabled rdxTooltipTrigger>Trigger</button>
        </div>
    `
})
class DisabledTriggerHostComponent {}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger, RdxTooltipPositioner, RdxTooltipPopup],
    template: `
        <div [open]="true" rdxTooltip>
            <button rdxTooltipTrigger>Trigger</button>
            <div rdxTooltipPositioner>
                <div rdxTooltipPopup>Popup</div>
            </div>
        </div>
    `
})
class PositionerDefaultsHostComponent {}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger, RdxTooltipPositioner, RdxTooltipPopup],
    template: `
        <div [open]="true" rdxTooltip>
            <button rdxTooltipTrigger>Trigger</button>
            <div [side]="'left'" [arrowPadding]="9" rdxTooltipPositioner>
                <div rdxTooltipPopup>Popup</div>
            </div>
        </div>
    `
})
class PositionerOverrideHostComponent {}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger],
    template: `
        <button id="detached" [handle]="handle" payload="one" rdxTooltipTrigger>One</button>
        <div [handle]="handle" rdxTooltip></div>
    `
})
class DetachedHostComponent {
    readonly handle = createRdxTooltipHandle();
}

@Component({
    imports: [RdxTooltip, RdxTooltipTrigger],
    template: `
        <div rdxTooltip>
            @if (showTrigger()) {
                <button rdxTooltipTrigger>Trigger</button>
            }
        </div>
    `
})
class RemovableTriggerHostComponent {
    readonly showTrigger = signal(true);
}

/** RdxTooltip can sit on an <ng-container> (a comment node); resolve it from a descendant. */
function getRoot(fixture: ComponentFixture<unknown>): RdxTooltip {
    return fixture.debugElement.query(By.directive(RdxTooltipTrigger)).injector.get(RdxTooltip);
}

describe('Tooltip', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;
    let trigger: HTMLButtonElement;
    let root: RdxTooltip;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        root = getRoot(fixture);
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('renders closed without describing the trigger', () => {
        expect(root.open()).toBe(false);
        expect(trigger.hasAttribute('data-popup-open')).toBe(false);
        expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    });

    it('links and marks the trigger when open via the model', () => {
        host.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(trigger.getAttribute('data-popup-open')).toBe('');
        expect(trigger.getAttribute('aria-describedby')).toMatch(/^rdx-tooltip-content-/);
    });

    it('emits onOpenChange only on changes', () => {
        host.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        host.open = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        vi.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(host.changes).toEqual([true, false]);
    });

    it('opens instantly on focus', () => {
        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.instant()).toBe(true);
        expect(host.open).toBe(true);
    });

    it('closes on blur after the close delay', () => {
        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('blur'));
        vi.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
    });

    it('respects a custom close delay', () => {
        host.closeDelay = 200;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('blur'));
        vi.advanceTimersByTime(199);
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        vi.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(false);
    });

    it('closes when the trigger is clicked while open', () => {
        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        trigger.click();
        vi.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
    });

    it('keeps the tooltip open on click when closeOnClick is false', () => {
        host.closeOnClick = false;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        trigger.click();
        vi.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(true);
    });

    it('opens after the delay on pointer move and is not instant', () => {
        trigger.dispatchEvent(new Event('pointermove'));
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        vi.advanceTimersByTime(599);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        vi.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
        expect(root.instant()).toBe(false);
    });

    it('cancels the delayed open when the pointer leaves before it fires', () => {
        trigger.dispatchEvent(new Event('pointermove'));
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('pointerleave'));
        vi.advanceTimersByTime(600);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
    });

    it('closes on pointer leave when the popup is not hoverable', () => {
        host.disableHoverablePopup = true;
        host.delay = 0;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        trigger.dispatchEvent(new Event('pointerleave'));
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        expect(root.open()).toBe(false);
    });

    it('ignores trigger interaction while disabled', () => {
        host.disabled = true;
        host.delay = 0;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('focus'));
        trigger.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(600);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
        expect(trigger.getAttribute('data-trigger-disabled')).toBe('');
    });

    it('still opens from the controlled input while disabled', () => {
        host.disabled = true;
        host.open = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(trigger.getAttribute('data-popup-open')).toBe('');
    });
});

describe('Tooltip multiple triggers', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('tracks the trigger the pointer entered as the active anchor', () => {
        TestBed.configureTestingModule({ imports: [MultipleTriggersHostComponent] });
        const fixture = TestBed.createComponent(MultipleTriggersHostComponent);
        fixture.detectChanges();

        const a: HTMLButtonElement = fixture.nativeElement.querySelector('#trigger-a');
        const b: HTMLButtonElement = fixture.nativeElement.querySelector('#trigger-b');
        const root = getRoot(fixture);

        b.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(b);
        expect(b.getAttribute('data-popup-open')).toBe('');
        expect(a.hasAttribute('data-popup-open')).toBe(false);
    });
});

describe('Tooltip per-trigger delay', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('lets the trigger override the root open delay', () => {
        TestBed.configureTestingModule({ imports: [TriggerDelayHostComponent] });
        const fixture = TestBed.createComponent(TriggerDelayHostComponent);
        fixture.detectChanges();

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        const root = getRoot(fixture);

        trigger.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(49);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        vi.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
    });
});

describe('Tooltip disabled trigger', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('never opens and reflects data-trigger-disabled', () => {
        TestBed.configureTestingModule({ imports: [DisabledTriggerHostComponent] });
        const fixture = TestBed.createComponent(DisabledTriggerHostComponent);
        fixture.detectChanges();

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        const root = getRoot(fixture);

        expect(trigger.getAttribute('data-trigger-disabled')).toBe('');

        trigger.dispatchEvent(new Event('focus'));
        trigger.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(50);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
    });
});

describe('Tooltip positioner defaults', () => {
    function popperOf(fixture: ComponentFixture<unknown>): RdxPopperContentWrapper {
        return fixture.debugElement.query(By.directive(RdxTooltipPositioner)).injector.get(RdxPopperContentWrapper);
    }

    it('applies Base UI defaults (side top, arrow/collision padding 5) to the popper', () => {
        TestBed.configureTestingModule({ imports: [PositionerDefaultsHostComponent] });
        const fixture = TestBed.createComponent(PositionerDefaultsHostComponent);
        fixture.detectChanges();

        const popper = popperOf(fixture);
        expect(popper.side()).toBe('top');
        expect(popper.arrowPadding()).toBe(5);
        expect(popper.collisionPadding()).toBe(5);
    });

    it('lets consumer bindings override the provided defaults', () => {
        TestBed.configureTestingModule({ imports: [PositionerOverrideHostComponent] });
        const fixture = TestBed.createComponent(PositionerOverrideHostComponent);
        fixture.detectChanges();

        const popper = popperOf(fixture);
        expect(popper.side()).toBe('left');
        expect(popper.arrowPadding()).toBe(9);
    });
});

describe('Tooltip handle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('opens and closes a detached root imperatively', () => {
        TestBed.configureTestingModule({ imports: [DetachedHostComponent] });
        const fixture = TestBed.createComponent(DetachedHostComponent);
        fixture.detectChanges();

        const handle = fixture.componentInstance.handle;
        const detached: HTMLButtonElement = fixture.nativeElement.querySelector('#detached');

        expect(handle.isOpen()).toBe(false);

        handle.open('detached');
        fixture.detectChanges();
        expect(handle.isOpen()).toBe(true);
        expect(detached.getAttribute('data-popup-open')).toBe('');

        handle.close();
        vi.advanceTimersByTime(0);
        fixture.detectChanges();
        expect(handle.isOpen()).toBe(false);
    });
});

describe('Tooltip provider', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('inherits the open delay from the provider', () => {
        TestBed.configureTestingModule({ imports: [ProviderHostComponent] });
        const fixture = TestBed.createComponent(ProviderHostComponent);
        fixture.detectChanges();

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        const root = getRoot(fixture);

        trigger.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(499);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        vi.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
    });
});

describe('Tooltip trigger removal', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('closes and clears the active trigger when it is removed', () => {
        TestBed.configureTestingModule({ imports: [RemovableTriggerHostComponent] });
        const fixture = TestBed.createComponent(RemovableTriggerHostComponent);
        fixture.detectChanges();

        const root = getRoot(fixture);
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        fixture.componentInstance.showTrigger.set(false);
        fixture.detectChanges();

        expect(root.trigger()).toBeUndefined();
        expect(root.open()).toBe(false);
    });
});

describe('Tooltip config', () => {
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('falls back to the default config without a provider', () => {
        TestBed.configureTestingModule({});
        const config = TestBed.runInInjectionContext(() => injectRdxTooltipConfig());

        expect(config).toEqual(defaultTooltipConfig);
        expect(config.delay).toBe(600);
        expect(config.timeout).toBe(400);
        expect(config.closeDelay).toBe(0);
    });

    it('uses the provided config delay when none is set on the root', () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [ConfiguredHostComponent] });
        const fixture = TestBed.createComponent(ConfiguredHostComponent);
        fixture.detectChanges();
        const root = getRoot(fixture);
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');

        trigger.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(1233);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        vi.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
    });
});
