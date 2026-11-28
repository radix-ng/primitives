import { ChangeDetectionStrategy, Component, Directive, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { Direction } from '@radix-ng/primitives/core';
import { RdxPortal } from '@radix-ng/primitives/portal';
import { afterEach, describe, expect, it } from 'vitest';
import { provideRadixNG } from '../../config/src/config.provider';
import { injectDirection, provideDirection, RdxDirectionProvider } from '../src/direction-provider';

@Directive({
    selector: '[directionProbe]',
    standalone: true
})
class DirectionProbe {
    readonly direction = injectDirection();
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [DirectionProbe],
    template: `
        <span directionProbe></span>
    `
})
class ProbeHost {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [DirectionProbe, RdxDirectionProvider],
    template: `
        <section [direction]="direction()" [dir]="dir()" rdxDirectionProvider>
            <span directionProbe></span>
        </section>
    `
})
class DirectionProviderHost {
    readonly direction = signal<Direction | undefined>('rtl');
    readonly dir = signal<Direction | undefined>(undefined);
}

@Component({
    imports: [DirectionProbe, RdxDirectionProvider, RdxPortal, RdxCompositeRoot, RdxCompositeItem],
    template: `
        <div #destination dir="ltr"></div>
        <section [direction]="direction()" rdxDirectionProvider>
            <div rdxDirectionProvider>
                <div [container]="destination" rdxPortal rdxCompositeRoot data-composite="inherited">
                    <button rdxCompositeItem>One</button>
                    <button rdxCompositeItem>Two</button>
                    <button rdxCompositeItem>Three</button>
                </div>
            </div>
            <div rdxDirectionProvider direction="ltr">
                <span directionProbe></span>
            </div>
        </section>
    `
})
class NestedDirectionProviderHost {
    readonly direction = signal<Direction>('rtl');
}

describe('DirectionProvider', () => {
    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('defaults to the global RadixNG direction', () => {
        TestBed.configureTestingModule({
            imports: [ProbeHost],
            providers: [provideRadixNG({ dir: 'rtl' })]
        });

        const fixture = TestBed.createComponent(ProbeHost);
        fixture.detectChanges();

        const probe = fixture.debugElement.query(By.directive(DirectionProbe)).injector.get(DirectionProbe);
        expect(probe.direction()).toBe('rtl');
    });

    it('supports a DI provider override', () => {
        const direction = signal<Direction>('rtl');

        TestBed.configureTestingModule({
            imports: [ProbeHost],
            providers: [provideDirection(direction)]
        });

        const fixture = TestBed.createComponent(ProbeHost);
        fixture.detectChanges();

        const probe = fixture.debugElement.query(By.directive(DirectionProbe)).injector.get(DirectionProbe);
        expect(probe.direction()).toBe('rtl');

        direction.set('ltr');
        fixture.detectChanges();

        expect(probe.direction()).toBe('ltr');
    });

    it('provides direction to descendants from the directive', () => {
        TestBed.configureTestingModule({ imports: [DirectionProviderHost] });

        const fixture = TestBed.createComponent(DirectionProviderHost);
        fixture.detectChanges();

        const host = fixture.componentInstance;
        const probe = fixture.debugElement.query(By.directive(DirectionProbe)).injector.get(DirectionProbe);

        expect(probe.direction()).toBe('rtl');

        host.direction.set('ltr');
        fixture.detectChanges();

        expect(probe.direction()).toBe('ltr');
    });

    it('prefers direction over dir and falls back to the parent as overrides are removed', async () => {
        const parentDirection = signal<Direction>('ltr');
        TestBed.configureTestingModule({ providers: [provideDirection(parentDirection)] });

        const fixture = TestBed.createComponent(DirectionProviderHost);
        const host = fixture.componentInstance;
        host.dir.set('ltr');
        await fixture.whenStable();

        const probe = fixture.debugElement.query(By.directive(DirectionProbe)).injector.get(DirectionProbe);
        expect(probe.direction()).toBe('rtl');

        parentDirection.set('rtl');
        host.direction.set(undefined);
        await fixture.whenStable();
        expect(probe.direction()).toBe('ltr');

        host.dir.set(undefined);
        await fixture.whenStable();
        expect(probe.direction()).toBe('rtl');

        parentDirection.set('ltr');
        await fixture.whenStable();
        expect(probe.direction()).toBe('ltr');
    });

    it('inherits direction through a nested provider and drives portalled keyboard navigation independently of native dir', async () => {
        const fixture = TestBed.createComponent(NestedDirectionProviderHost);
        await fixture.whenStable();
        const host: HTMLElement = fixture.nativeElement;
        const composite = host.querySelector<HTMLElement>('[data-composite="inherited"]')!;
        const destination = host.querySelector('[dir="ltr"]');
        const [first, middle, last] = composite.querySelectorAll<HTMLButtonElement>('button');
        const explicit = fixture.debugElement.query(By.directive(DirectionProbe)).injector.get(DirectionProbe);

        expect(composite.parentElement).toBe(destination);
        expect(composite.closest('[dir]')).toBe(destination);
        expect(composite.getAttribute('dir')).toBeNull();
        expect(explicit.direction()).toBe('ltr');

        const pressRightFromMiddle = async () => {
            middle.focus();
            middle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
            await fixture.whenStable();
        };

        await pressRightFromMiddle();
        expect(document.activeElement).toBe(first);

        fixture.componentInstance.direction.set('ltr');
        await fixture.whenStable();
        await pressRightFromMiddle();
        expect(document.activeElement).toBe(last);
        expect(composite.parentElement).toBe(destination);
        expect(composite.closest('[dir]')).toBe(destination);
        expect(explicit.direction()).toBe('ltr');
    });
});
