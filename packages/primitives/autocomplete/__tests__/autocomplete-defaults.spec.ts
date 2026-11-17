import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { _importsAutocomplete, RdxAutocompleteRoot } from '../index';

@Component({
    imports: [_importsAutocomplete],
    template: `
        <div
            [defaultValue]="seed()"
            [defaultOpen]="seedOpen()"
            (onValueChange)="changes.push($event)"
            rdxAutocompleteRoot
        >
            <input rdxAutocompleteInput aria-label="Query" />
        </div>
    `
})
class DefaultsHost {
    readonly seed = signal<string | undefined>('Seed');
    readonly seedOpen = signal(false);
    readonly changes: unknown[] = [];
}
@Component({
    imports: [_importsAutocomplete],
    template: `
        <div [(value)]="value" [(open)]="open" defaultValue="Seed" defaultOpen rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Query" />
        </div>
    `
})
class ExplicitHost {
    readonly value = signal('');
    readonly open = signal(false);
}
@Component({
    imports: [_importsAutocomplete, ReactiveFormsModule],
    template: `
        <div [formControl]="control" defaultValue="Seed" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Query" />
        </div>
    `
})
class ReactiveHost {
    readonly control = new FormControl('');
}
@Component({
    imports: [_importsAutocomplete, FormsModule],
    template: `
        <div [(ngModel)]="value" defaultValue="Seed" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Query" />
        </div>
    `
})
class TemplateHost {
    readonly value = signal('');
}
@Component({
    imports: [_importsAutocomplete, FormField],
    template: `
        <div [formField]="tree.query" defaultValue="Seed" rdxAutocompleteRoot>
            <input rdxAutocompleteInput aria-label="Query" />
        </div>
    `
})
class SignalHost {
    readonly data = signal({ query: '' });
    readonly tree = form(this.data);
}

@Component({
    imports: [_importsAutocomplete],
    template: `
        <form>
            @if (controlled()) {
                <div [(value)]="value" [defaultValue]="seed()" name="query" rdxAutocompleteRoot>
                    <input rdxAutocompleteInput aria-label="Query" />
                </div>
            } @else {
                <div [defaultValue]="seed()" name="query" rdxAutocompleteRoot>
                    <input rdxAutocompleteInput aria-label="Query" />
                </div>
            }
        </form>
    `
})
class NativeHost {
    readonly controlled = signal(false);
    readonly value = signal('');
    readonly seed = signal('Seed');
}

const root = (fixture: ReturnType<typeof TestBed.createComponent>) =>
    fixture.debugElement.query(By.directive(RdxAutocompleteRoot)).injector.get(RdxAutocompleteRoot);
describe('Autocomplete initial defaults', () => {
    it.each([false, true])(
        'keeps the initial native reset baseline after defaults change (bound: %s)',
        async (controlled) => {
            const fixture = TestBed.createComponent(NativeHost);
            fixture.componentInstance.controlled.set(controlled);
            await fixture.whenStable();
            root(fixture).setQuery('Edited');
            fixture.componentInstance.seed.set('Later');
            await fixture.whenStable();
            expect(root(fixture).value()).toBe('Edited');
            fixture.nativeElement.querySelector('form').reset();
            await vi.waitFor(() => expect(root(fixture).value()).toBe(controlled ? '' : 'Seed'));
            await fixture.whenStable();
            expect(fixture.nativeElement.querySelector('input').value).toBe(controlled ? '' : 'Seed');
        }
    );

    it('honors explicitly empty and closed models over defaults', async () => {
        const fixture = TestBed.createComponent(ExplicitHost);
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
        expect(root(fixture).open()).toBe(false);
        expect(fixture.componentInstance.value()).toBe('');
        expect(fixture.componentInstance.open()).toBe(false);
    });
    it('snapshots defaults without emitting detailed change requests', async () => {
        const fixture = TestBed.createComponent(DefaultsHost);
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('Seed');
        expect(fixture.componentInstance.changes).toEqual([]);
        fixture.componentInstance.seed.set('Later');
        fixture.componentInstance.seedOpen.set(true);
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('Seed');
        expect(root(fixture).open()).toBe(false);
    });
    it('does not apply a default supplied only after initialization', async () => {
        const fixture = TestBed.createComponent(DefaultsHost);
        fixture.componentInstance.seed.set(undefined);
        await fixture.whenStable();
        fixture.componentInstance.seed.set('Later');
        fixture.componentInstance.seedOpen.set(true);
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
        expect(root(fixture).open()).toBe(false);
    });
    it('does not refill a cleared uncontrolled value after a default changes', async () => {
        const fixture = TestBed.createComponent(DefaultsHost);
        await fixture.whenStable();
        root(fixture).clearValue();
        fixture.componentInstance.seed.set('Later');
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
    });
    it('honors an empty Reactive Forms write and reset over the default', async () => {
        const fixture = TestBed.createComponent(ReactiveHost);
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
        root(fixture).setQuery('Edited');
        await fixture.whenStable();
        fixture.componentInstance.control.reset();
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
        expect(fixture.componentInstance.control.value).toBeNull();
    });
    it('honors empty template forms initialization and updates', async () => {
        const fixture = TestBed.createComponent(TemplateHost);
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
        expect(fixture.componentInstance.value()).toBe('');
        fixture.componentInstance.value.set('External');
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('External');
    });
    it('honors empty Signal Forms initialization and reset', async () => {
        const fixture = TestBed.createComponent(SignalHost);
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
        expect(fixture.componentInstance.data().query).toBe('');
        root(fixture).setQuery('Edited');
        await fixture.whenStable();
        fixture.componentInstance.tree().reset({ query: '' });
        await fixture.whenStable();
        expect(root(fixture).value()).toBe('');
        expect(fixture.componentInstance.data().query).toBe('');
    });
});
