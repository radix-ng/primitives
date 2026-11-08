import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { useNativeFormControl } from '../src/dom/use-native-form-control';

@Component({
    template: `
        <form id="core-native-form">
            @if (hasNative()) {
                <input name="choice" value="consumer-owned" />
            }
        </form>
    `
})
class Host {
    readonly value = signal('initial');
    readonly hasNative = signal(false);
    readonly autoComplete = signal<string | undefined>('off');
    readonly name = signal<string | undefined>('choice');
    readonly changes: string[] = [];
    readonly native = useNativeFormControl({
        name: this.name,
        form: signal('core-native-form'),
        disabled: signal(false),
        value: this.value,
        serialize: (value) => [value],
        hasNativeControl: this.hasNative,
        input: {
            type: () => 'text',
            name: this.name,
            value: this.value,
            autoComplete: this.autoComplete,
            onChange: (value) => {
                this.changes.push(value);
                this.value.set(value);
            }
        },
        defaultValue: this.value,
        onReset: (value) => this.value.set(value)
    });
}

describe('shared persistent native input', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [Host] }));

    it('hands submission ownership to a consumer input and back without duplicate entries', async () => {
        const fixture = TestBed.createComponent(Host);
        const settle = async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        };
        await settle();
        const host = fixture.componentInstance;
        const form = fixture.nativeElement.querySelector('form');
        expect(new FormData(form).getAll('choice')).toEqual(['initial']);
        const oldInput = host.native.inputElement()!;
        host.hasNative.set(true);
        await settle();
        expect(host.native.inputElement()).toBeNull();
        expect(new FormData(form).getAll('choice')).toEqual(['consumer-owned']);
        oldInput.value = 'stale';
        oldInput.dispatchEvent(new Event('change', { bubbles: true }));
        await settle();
        expect(host.value()).toBe('initial');
        host.hasNative.set(false);
        await settle();
        expect(new FormData(form).getAll('choice')).toEqual(['initial']);
    });

    it('coalesces browser events, observes cancellation and updates input-only attributes', async () => {
        const fixture = TestBed.createComponent(Host);
        const settle = async () => {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        };
        await settle();
        const host = fixture.componentInstance;
        const input = host.native.inputElement()!;
        input.value = 'next';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await settle();
        expect(host.changes).toEqual(['next']);
        const cancel = new Event('change', { bubbles: true, cancelable: true });
        input.value = 'canceled';
        input.addEventListener('change', (event) => event.preventDefault(), { once: true });
        input.dispatchEvent(cancel);
        await settle();
        expect(host.value()).toBe('next');
        expect(input.value).toBe('next');
        host.autoComplete.set('country');
        await settle();
        expect(input.autocomplete).toBe('country');
        fixture.nativeElement.querySelector('form').reset();
        await settle();
        expect(host.value()).toBe('initial');
    });
});
