import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { _importsSelect, RdxSelectRoot, RdxSelectValueChangeEvent } from '../index';

@Component({
    imports: [_importsSelect],
    template: `
        <div [defaultValue]="'apple'" [multiple]="multiple()" (onValueChange)="changed($event)" rdxSelectRoot>
            <button rdxSelectTrigger>Fruit</button>
            <ng-template rdxSelectPortal>
                <div rdxSelectPositioner>
                    <div rdxSelectPopup>
                        <div rdxSelectList>
                            @for (fruit of fruits(); track fruit) {
                                <div [value]="fruit" rdxSelectItem>
                                    <span rdxSelectItemText>{{ fruit }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
class Host {
    readonly fruits = signal(['apple', 'banana', 'cherry']);
    readonly multiple = signal(false);
    readonly events: RdxSelectValueChangeEvent[] = [];
    cancel = false;
    changed(event: RdxSelectValueChangeEvent) {
        this.events.push(event);
        if (this.cancel) event.eventDetails.cancel();
    }
}

describe('Select dynamic option reconciliation', () => {
    let fixture: ComponentFixture<Host>;
    let root: RdxSelectRoot;
    async function settle() {
        fixture.detectChanges();
        await fixture.whenStable();
    }
    async function open() {
        root.open.set(true);
        await settle();
    }
    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [Host] });
        fixture = TestBed.createComponent(Host);
        await settle();
        root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
    });

    it('clears a removed scalar and emits one cancelable change', async () => {
        await open();
        fixture.componentInstance.fruits.set(['banana', 'cherry']);
        await settle();
        expect(root.value()).toBeNull();
        expect(fixture.componentInstance.events).toHaveLength(1);
        expect(fixture.componentInstance.events[0].eventDetails.reason).toBe('none');
    });
    it('falls back to the initial value if it is still available', async () => {
        await open();
        root.setValue('banana');
        await settle();
        fixture.componentInstance.fruits.set(['apple', 'cherry']);
        await settle();
        expect(root.value()).toBe('apple');
    });
    it('prunes multiple values without toggling retained selections', async () => {
        fixture.componentInstance.multiple.set(true);
        root.value.set(['apple', 'banana']);
        await open();
        fixture.componentInstance.fruits.set(['banana', 'cherry']);
        await settle();
        expect(root.value()).toEqual(['banana']);
        expect(fixture.componentInstance.events).toHaveLength(1);
    });
    it('honors cancellation without retrying on unrelated rendering', async () => {
        await open();
        fixture.componentInstance.cancel = true;
        fixture.componentInstance.fruits.set(['banana', 'cherry']);
        await settle();
        await settle();
        expect(root.value()).toBe('apple');
        expect(fixture.componentInstance.events).toHaveLength(1);
    });
    it('does not clear selection when the popup closes and its views are removed', async () => {
        await open();
        root.open.set(false);
        await settle();
        expect(root.value()).toBe('apple');
        expect(fixture.componentInstance.events).toEqual([]);
    });
    it('does not reconcile an initially empty collection or its first asynchronous load', async () => {
        fixture.componentInstance.fruits.set([]);
        await open();
        fixture.componentInstance.fruits.set(['banana']);
        await settle();
        expect(root.value()).toBe('apple');
        expect(fixture.componentInstance.events).toEqual([]);
    });
});
