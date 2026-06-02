import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    createRdxTooltipHandle,
    RdxTooltip,
    RdxTooltipProvider,
    RdxTooltipTrigger
} from '@radix-ng/primitives/tooltip';
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
        jest.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestHostComponent] });
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        trigger = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        root = getRoot(fixture);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('renders closed without describing the trigger', () => {
        expect(root.open()).toBe(false);
        expect(trigger.hasAttribute('data-popup-open')).toBe(false);
        expect(trigger.hasAttribute('aria-describedby')).toBe(false);
    });

    it('links and marks the trigger when open via the model', () => {
        host.open = true;
        fixture.detectChanges();

        expect(trigger.getAttribute('data-popup-open')).toBe('');
        expect(trigger.getAttribute('aria-describedby')).toMatch(/^rdx-tooltip-content-/);
    });

    it('emits onOpenChange only on changes', () => {
        host.open = true;
        fixture.detectChanges();
        host.open = false;
        fixture.detectChanges();
        jest.advanceTimersByTime(0);
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
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
    });

    it('respects a custom close delay', () => {
        host.closeDelay = 200;
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('blur'));
        jest.advanceTimersByTime(199);
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        jest.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(false);
    });

    it('closes when the trigger is clicked while open', () => {
        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        trigger.click();
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
    });

    it('keeps the tooltip open on click when closeOnClick is false', () => {
        host.closeOnClick = false;
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('focus'));
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        trigger.click();
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(true);
    });

    it('opens after the delay on pointer move and is not instant', () => {
        trigger.dispatchEvent(new Event('pointermove'));
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        jest.advanceTimersByTime(599);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        jest.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
        expect(root.instant()).toBe(false);
    });

    it('cancels the delayed open when the pointer leaves before it fires', () => {
        trigger.dispatchEvent(new Event('pointermove'));
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('pointerleave'));
        jest.advanceTimersByTime(600);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
    });

    it('closes on pointer leave when the popup is not hoverable', () => {
        host.disableHoverablePopup = true;
        host.delay = 0;
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('pointermove'));
        jest.advanceTimersByTime(0);
        fixture.detectChanges();
        expect(root.open()).toBe(true);

        trigger.dispatchEvent(new Event('pointerleave'));
        jest.advanceTimersByTime(0);
        fixture.detectChanges();
        expect(root.open()).toBe(false);
    });

    it('ignores trigger interaction while disabled', () => {
        host.disabled = true;
        host.delay = 0;
        fixture.detectChanges();

        trigger.dispatchEvent(new Event('focus'));
        trigger.dispatchEvent(new Event('pointermove'));
        jest.advanceTimersByTime(600);
        fixture.detectChanges();

        expect(root.open()).toBe(false);
        expect(trigger.getAttribute('data-trigger-disabled')).toBe('');
    });

    it('still opens from the controlled input while disabled', () => {
        host.disabled = true;
        host.open = true;
        fixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(trigger.getAttribute('data-popup-open')).toBe('');
    });
});

describe('Tooltip multiple triggers', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('tracks the trigger the pointer entered as the active anchor', () => {
        TestBed.configureTestingModule({ imports: [MultipleTriggersHostComponent] });
        const fixture = TestBed.createComponent(MultipleTriggersHostComponent);
        fixture.detectChanges();

        const a: HTMLButtonElement = fixture.nativeElement.querySelector('#trigger-a');
        const b: HTMLButtonElement = fixture.nativeElement.querySelector('#trigger-b');
        const root = getRoot(fixture);

        b.dispatchEvent(new Event('pointermove'));
        jest.advanceTimersByTime(0);
        fixture.detectChanges();

        expect(root.open()).toBe(true);
        expect(root.trigger()).toBe(b);
        expect(b.getAttribute('data-popup-open')).toBe('');
        expect(a.hasAttribute('data-popup-open')).toBe(false);
    });
});

describe('Tooltip per-trigger delay', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('lets the trigger override the root open delay', () => {
        TestBed.configureTestingModule({ imports: [TriggerDelayHostComponent] });
        const fixture = TestBed.createComponent(TriggerDelayHostComponent);
        fixture.detectChanges();

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        const root = getRoot(fixture);

        trigger.dispatchEvent(new Event('pointermove'));
        jest.advanceTimersByTime(49);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        jest.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
    });
});

describe('Tooltip handle', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
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
        jest.advanceTimersByTime(0);
        fixture.detectChanges();
        expect(handle.isOpen()).toBe(false);
    });
});

describe('Tooltip provider', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('inherits the open delay from the provider', () => {
        TestBed.configureTestingModule({ imports: [ProviderHostComponent] });
        const fixture = TestBed.createComponent(ProviderHostComponent);
        fixture.detectChanges();

        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');
        const root = getRoot(fixture);

        trigger.dispatchEvent(new Event('pointermove'));
        jest.advanceTimersByTime(499);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        jest.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
    });
});

describe('Tooltip trigger removal', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
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
        jest.clearAllTimers();
        jest.useRealTimers();
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
        jest.useFakeTimers();
        TestBed.configureTestingModule({ imports: [ConfiguredHostComponent] });
        const fixture = TestBed.createComponent(ConfiguredHostComponent);
        fixture.detectChanges();
        const root = getRoot(fixture);
        const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[rdxTooltipTrigger]');

        trigger.dispatchEvent(new Event('pointermove'));
        jest.advanceTimersByTime(1233);
        fixture.detectChanges();
        expect(root.open()).toBe(false);

        jest.advanceTimersByTime(1);
        fixture.detectChanges();
        expect(root.open()).toBe(true);
    });
});
