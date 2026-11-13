import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createRdxMenuHandle, RdxMenuModule, RdxMenuOpenChange, RdxMenuRoot } from '../index';

@Component({
    imports: [RdxMenuModule],
    template: `
        <button [handle]="handle" [id]="id()" [payload]="value()" rdxMenuTrigger>First</button>
        <button id="second" [handle]="handle" [payload]="second" rdxMenuTrigger>Second</button>
        @if (mounted()) {
            <div [handle]="handle" rdxMenuRoot></div>
        }
    `
})
class Host {
    readonly handle = createRdxMenuHandle<{ name: string }>();
    readonly id = signal('first');
    readonly value = signal({ name: 'First' });
    readonly second = { name: 'Second' };
    readonly mounted = signal(true);
}

describe('Menu handle ownership', () => {
    it.each(['older', 'newer'] as const)(
        'keeps the surviving Root usable when the %s Root detaches',
        async (removed) => {
            @Component({
                imports: [RdxMenuModule],
                template: `
                    <button id="first" [handle]="handle" [payload]="value()" rdxMenuTrigger>First</button>
                    @for (id of owners(); track id) {
                        <div [attr.data-owner]="id" [handle]="handle" rdxMenuRoot></div>
                    }
                `
            })
            class OverlappingHost {
                readonly handle = createRdxMenuHandle<string>();
                readonly owners = signal(['older']);
                readonly value = signal('initial');
            }
            const fixture = TestBed.createComponent(OverlappingHost);
            try {
                await fixture.whenStable();
                const app = fixture.componentInstance;
                app.owners.set(['older', 'newer']);
                await fixture.whenStable();
                const roots = fixture.debugElement.queryAll(By.directive(RdxMenuRoot));
                const older = roots[0].injector.get(RdxMenuRoot);
                const newer = roots[1].injector.get(RdxMenuRoot);
                app.handle.open('first');
                await fixture.whenStable();
                expect(newer.open()).toBe(true);
                expect(older.open()).toBe(false);
                app.handle.close();
                await fixture.whenStable();
                app.owners.set([removed === 'older' ? 'newer' : 'older']);
                app.value.set('updated');
                await fixture.whenStable();
                const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
                trigger.click();
                await fixture.whenStable();
                const surviving = removed === 'older' ? newer : older;
                expect(surviving.open()).toBe(true);
                expect(surviving.trigger()).toBe(trigger);
                expect(surviving.payload()).toBe('updated');
                expect(app.handle.isOpen()).toBe(true);
                app.handle.close();
                await fixture.whenStable();
                expect(surviving.open()).toBe(false);
            } finally {
                fixture.destroy();
            }
        }
    );

    it.each([false, true])(
        'returns through the completed exit after a handle reopen, retained=%s',
        async (retained) => {
            @Component({
                imports: [RdxMenuModule],
                template: `
                    <button id="first" [handle]="handle" rdxMenuTrigger>First</button>
                    <button id="second" [handle]="handle" rdxMenuTrigger>Second</button>
                    <ng-container
                        [handle]="handle"
                        [modal]="false"
                        (onOpenChange)="change($event)"
                        (onOpenChangeComplete)="completed.push($event)"
                        rdxMenuRoot
                    >
                        <ng-template [keepMounted]="keep" rdxMenuPortal>
                            <div rdxMenuPositioner>
                                <div rdxMenuPopup><button rdxMenuItem>Action</button></div>
                            </div>
                        </ng-template>
                    </ng-container>
                `
            })
            class ReopeningHost {
                readonly handle = createRdxMenuHandle();
                readonly keep = retained;
                readonly completed: boolean[] = [];
                private closes = 0;
                change(change: RdxMenuOpenChange) {
                    if (!change.open && ++this.closes === 1) change.eventDetails.preventUnmountOnClose();
                }
            }
            const fixture = TestBed.createComponent(ReopeningHost);
            try {
                await fixture.whenStable();
                const first = fixture.nativeElement.querySelector('#first') as HTMLButtonElement;
                const second = fixture.nativeElement.querySelector('#second') as HTMLButtonElement;
                first.focus();
                fixture.componentInstance.handle.open('first');
                await fixture.whenStable();
                await vi.waitFor(() => expect(fixture.componentInstance.completed).toEqual([true]));
                const popup = document.querySelector('[rdxMenuPopup]')!;
                expect(document.activeElement).toBe(popup);
                fixture.componentInstance.handle.close();
                await fixture.whenStable();
                expect(document.activeElement).toBe(popup);
                expect(fixture.componentInstance.completed).toEqual([true]);
                fixture.componentInstance.handle.open('second');
                await fixture.whenStable();
                await vi.waitFor(() => expect(fixture.componentInstance.completed).toEqual([true, true]));
                fixture.componentInstance.handle.close();
                await fixture.whenStable();
                await vi.waitFor(() => expect(fixture.componentInstance.completed).toEqual([true, true, false]));
                await vi.waitFor(() => expect(document.activeElement).toBe(retained ? first : second));
            } finally {
                fixture.destroy();
            }
        }
    );
    it('an unattached explicit handle does not fall back to an unrelated declaring Menu', () => {
        @Component({
            imports: [RdxMenuModule],
            template: `
                <div rdxMenuRoot><button [handle]="handle" rdxMenuTrigger>Detached</button></div>
            `
        })
        class NestedHost {
            readonly handle = createRdxMenuHandle();
        }
        const fixture = TestBed.createComponent(NestedHost);
        fixture.detectChanges();
        const root = fixture.debugElement.query(By.directive(RdxMenuRoot)).injector.get(RdxMenuRoot);
        const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
        trigger.click();
        fixture.detectChanges();
        expect(root.open()).toBe(false);
        expect(root.trigger()).toBeUndefined();
        expect(trigger.getAttribute('aria-expanded')).toBeNull();
        fixture.destroy();
    });
    it('keeps payloads reactive and preserves the active native element through an id change', () => {
        const fixture = TestBed.createComponent(Host);
        fixture.detectChanges();
        const app = fixture.componentInstance;
        app.handle.open('first');
        fixture.detectChanges();
        const root = fixture.debugElement.query(By.directive(RdxMenuRoot)).injector.get(RdxMenuRoot);
        const first = fixture.nativeElement.querySelector('button');
        expect(root.trigger()).toBe(first);
        expect(root.payload()).toEqual({ name: 'First' });
        app.value.set({ name: 'Updated' });
        fixture.detectChanges();
        expect(root.payload()).toEqual({ name: 'Updated' });
        app.id.set('renamed');
        fixture.detectChanges();
        expect(root.trigger()).toBe(first);
        expect(root.triggerId()).toBe('renamed');
        app.handle.close();
        fixture.detectChanges();
        app.handle.open('renamed');
        fixture.detectChanges();
        expect(root.open()).toBe(true);
        fixture.destroy();
    });

    it('ignores requests without an owner, then reconnects surviving external triggers', () => {
        const fixture = TestBed.createComponent(Host);
        fixture.detectChanges();
        const app = fixture.componentInstance;
        app.mounted.set(false);
        fixture.detectChanges();
        expect(app.handle.isOpen()).toBe(false);
        expect(() => app.handle.open('second')).not.toThrow();
        app.mounted.set(true);
        fixture.detectChanges();
        app.handle.open('second');
        fixture.detectChanges();
        const root = fixture.debugElement.query(By.directive(RdxMenuRoot)).injector.get(RdxMenuRoot);
        expect(root.open()).toBe(true);
        expect(root.payload()).toEqual({ name: 'Second' });
        fixture.destroy();
    });
});
