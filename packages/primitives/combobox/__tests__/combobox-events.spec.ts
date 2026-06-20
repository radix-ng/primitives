import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _importsCombobox } from '../index';
import { RdxComboboxOpenChange } from '../src/combobox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <form>
            <div [(open)]="open" submitOnItemClick rdxComboboxRoot>
                <input rdxComboboxInput aria-label="Fruit" />
                <div *rdxComboboxPortal rdxComboboxPositioner>
                    <div rdxComboboxPopup>
                        <div rdxComboboxList aria-label="Fruits">
                            @for (fruit of fruits; track fruit) {
                                <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
})
class SubmitHost {
    readonly open = signal(false);
    readonly fruits = ['Apple', 'Banana'];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" (onOpenChangeComplete)="completed.set($event)" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class CompleteHost {
    readonly open = signal(false);
    readonly completed = signal<boolean | '__init__'>('__init__');
    readonly fruits = ['Apple', 'Banana'];
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [_importsCombobox],
    template: `
        <div [(open)]="open" (onOpenChange)="handleOpenChange($event)" rdxComboboxRoot>
            <input rdxComboboxInput aria-label="Fruit" />
            <button rdxComboboxTrigger>Toggle</button>
            <div *rdxComboboxPortal rdxComboboxPositioner>
                <div rdxComboboxPopup>
                    <div rdxComboboxList aria-label="Fruits">
                        @for (fruit of fruits; track fruit) {
                            <div [value]="fruit" rdxComboboxItem>{{ fruit }}</div>
                        }
                    </div>
                </div>
            </div>
        </div>
    `
})
class OpenChangeHost {
    readonly open = signal(false);
    readonly fruits = ['Apple', 'Banana'];
    readonly events = signal<RdxComboboxOpenChange[]>([]);
    readonly cancelNext = signal(false);
    readonly keepMountedOnClose = signal(false);

    handleOpenChange(change: RdxComboboxOpenChange): void {
        this.events.update((events) => [...events, change]);

        if (this.cancelNext()) {
            change.eventDetails.cancel();
            this.cancelNext.set(false);
        }

        if (!change.open && this.keepMountedOnClose()) {
            change.eventDetails.preventUnmountOnClose();
        }
    }
}

async function frame(): Promise<void> {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r));
}

describe('Combobox submitOnItemClick', () => {
    let fixture: ComponentFixture<SubmitHost>;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [SubmitHost] });
        fixture = TestBed.createComponent(SubmitHost);
        await settle();
    });

    it('requests submit of the closest form when an item is selected', async () => {
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        const submitSpy = vi.spyOn(input.form as HTMLFormElement, 'requestSubmit').mockImplementation(() => {});

        fixture.componentInstance.open.set(true);
        await settle();
        const items = Array.from(document.querySelectorAll('[rdxComboboxItem]')) as HTMLElement[];
        items[0].click();
        await settle();

        expect(submitSpy).toHaveBeenCalledTimes(1);
    });
});

describe('Combobox onOpenChangeComplete', () => {
    let fixture: ComponentFixture<CompleteHost>;
    let host: CompleteHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [CompleteHost] });
        fixture = TestBed.createComponent(CompleteHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('fires true after opening and false after closing', async () => {
        expect(host.completed()).toBe('__init__');

        host.open.set(true);
        await settle();
        await frame();
        await settle();
        expect(host.completed()).toBe(true);

        host.open.set(false);
        await settle();
        await frame();
        await settle();
        expect(host.completed()).toBe(false);
    });
});

describe('Combobox onOpenChange contract', () => {
    let fixture: ComponentFixture<OpenChangeHost>;
    let host: OpenChangeHost;

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [OpenChangeHost] });
        fixture = TestBed.createComponent(OpenChangeHost);
        host = fixture.componentInstance;
        await settle();
    });

    it('emits input-press details and lets the handler cancel opening', async () => {
        host.cancelNext.set(true);

        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        input.click();
        await settle();

        const change = host.events().at(-1);
        expect(change?.open).toBe(true);
        expect(change?.reason).toBe('input-press');
        expect(change?.eventDetails.isCanceled()).toBe(true);
        expect(host.open()).toBe(false);
    });

    it('emits item-press with the real DOM event and honors preventUnmountOnClose', async () => {
        host.open.set(true);
        host.keepMountedOnClose.set(true);
        await settle();

        const item = document.querySelector('[rdxComboboxItem]') as HTMLElement;
        item.click();
        await settle();

        const change = host.events().at(-1);
        expect(change?.open).toBe(false);
        expect(change?.reason).toBe('item-press');
        expect(change?.event instanceof MouseEvent).toBe(true);
        expect(host.open()).toBe(false);
        expect(document.querySelector('[rdxComboboxPopup]')).not.toBeNull();
    });
});
