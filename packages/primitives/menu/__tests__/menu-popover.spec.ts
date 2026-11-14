import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { popoverImports } from '@radix-ng/primitives/popover';
import { menuImports, type RdxMenuOpenChange } from '../index';

@Component({
    imports: [...menuImports, ...popoverImports],
    template: `
        <ng-container
            (onOpenChange)="hostChanges.push($event.reason)"
            (onOpenChangeComplete)="hostCompletions.push($event)"
            rdxPopoverRoot
        >
            <button id="host-trigger" rdxPopoverTrigger>Open</button>
            <ng-template rdxPopoverPortal>
                <div rdxPopoverPositioner>
                    <div rdxPopoverPopup>
                        <ng-container
                            (onOpenChange)="change($event)"
                            (onOpenChangeComplete)="menuCompletions.push($event)"
                            rdxMenuRoot
                        >
                            <button id="menu-trigger" rdxMenuTrigger>Actions</button>
                            <ng-template rdxMenuPortal>
                                <div rdxMenuPositioner>
                                    <div rdxMenuPopup><button rdxMenuItem>Action</button></div>
                                </div>
                            </ng-template>
                        </ng-container>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
class Host {
    readonly hostChanges: string[] = [];
    readonly hostCompletions: boolean[] = [];
    readonly menuCompletions: boolean[] = [];
    defer = false;
    change(change: RdxMenuOpenChange) {
        if (!change.open && this.defer) change.eventDetails.preventUnmountOnClose();
    }
}

describe('Menu inside Popover press phases', () => {
    it.each([
        { deferred: false, fast: false },
        { deferred: true, fast: false },
        { deferred: false, fast: true },
        { deferred: true, fast: true }
    ])(
        'closes Menu on pointerdown, then Popover on click; deferred=$deferred, fast=$fast',
        async ({ deferred, fast }) => {
            const fixture = TestBed.createComponent(Host);
            const warnings = vi.spyOn(console, 'warn');
            try {
                fixture.componentInstance.defer = deferred;
                await fixture.whenStable();
                fixture.nativeElement.querySelector('#host-trigger').click();
                await fixture.whenStable();
                await vi.waitFor(() => expect(fixture.componentInstance.hostCompletions).toEqual([true]));
                (document.querySelector('#menu-trigger') as HTMLButtonElement).click();
                await fixture.whenStable();
                await vi.waitFor(() => expect(fixture.componentInstance.menuCompletions).toEqual([true]));
                // A fresh gesture starts after dismissal's next-task opening-press guard installs.
                await new Promise<void>((resolve) => setTimeout(resolve, 0));
                expect(fixture.componentInstance.hostChanges).toEqual(['trigger-press']);
                expect(document.querySelector('[rdxMenuPopup]')).not.toBeNull();
                document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
                if (!fast) {
                    await fixture.whenStable();
                    await vi.waitFor(() =>
                        expect(fixture.componentInstance.menuCompletions).toEqual(deferred ? [true] : [true, false])
                    );
                    expect(fixture.componentInstance.hostCompletions).toEqual([true]);
                }
                document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                await fixture.whenStable();
                await vi.waitFor(() => expect(fixture.componentInstance.hostCompletions).toEqual([true, false]));
                await vi.waitFor(() =>
                    expect(fixture.componentInstance.menuCompletions).toEqual(deferred ? [true] : [true, false])
                );
                expect(document.querySelector('[rdxMenuPopup]')).toBeNull();
                expect(warnings.mock.calls.flat().join('\n')).not.toContain('NG0953');
            } finally {
                fixture.destroy();
                warnings.mockRestore();
            }
        }
    );
});
