import { provideRadixNG } from '../../config/src/config.provider';
import { injectDirection, provideDirection, RdxDirectionProvider } from '../src/direction-provider';
import { ChangeDetectionStrategy, Component, Directive, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Direction } from '@radix-ng/primitives/core';
import { afterEach, describe, expect, it } from 'vitest';

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
        <section rdxDirectionProvider [direction]="direction()">
            <span directionProbe></span>
        </section>
    `
})
class DirectionProviderHost {
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
});
