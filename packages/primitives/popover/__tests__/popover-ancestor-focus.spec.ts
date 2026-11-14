import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { popoverImports, type RdxPopoverOpenChange } from '../index';

@Component({
    imports: [...popoverImports],
    template: `
        <ng-container rdxPopoverRoot>
            <button id="parent-trigger" rdxPopoverTrigger>Parent</button>
            <ng-template rdxPopoverPortal>
                <div rdxPopoverPositioner>
                    <div data-testid="parent-popup" rdxPopoverPopup>
                        <ng-container (onOpenChange)="changes.push($event)" rdxPopoverRoot>
                            <button id="child-trigger" rdxPopoverTrigger>Child</button>
                            <ng-template rdxPopoverPortal>
                                <div rdxPopoverPositioner>
                                    <div data-testid="child-popup" rdxPopoverPopup>
                                        <button id="child-close" rdxPopoverClose>Close child</button>
                                    </div>
                                </div>
                            </ng-template>
                        </ng-container>
                    </div>
                </div>
            </ng-template>
        </ng-container>
    `
})
class NestedHost {
    readonly changes: RdxPopoverOpenChange[] = [];
}

it('keeps same-family ancestor focus related until the completed outside click', async () => {
    const fixture = TestBed.createComponent(NestedHost);
    try {
        await fixture.whenStable();
        fixture.nativeElement.querySelector('#parent-trigger').click();
        await fixture.whenStable();
        await vi.waitFor(() => expect(document.querySelector('#child-trigger')).not.toBeNull());
        (document.querySelector('#child-trigger') as HTMLButtonElement).click();
        await fixture.whenStable();
        await vi.waitFor(() => expect(document.activeElement?.id).toBe('child-close'));
        const parent = document.querySelector<HTMLElement>('[data-testid="parent-popup"]')!;
        parent.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        document
            .querySelector('#child-close')!
            .dispatchEvent(new FocusEvent('focusout', { relatedTarget: parent, bubbles: true }));
        await fixture.whenStable();
        expect(fixture.componentInstance.changes.map((change) => change.reason)).toEqual(['trigger-press']);
        parent.click();
        await fixture.whenStable();
        await vi.waitFor(() => expect(document.querySelector('[data-testid="child-popup"]')).toBeNull());
        expect(fixture.componentInstance.changes.map((change) => change.reason)).toEqual([
            'trigger-press',
            'outside-press'
        ]);
        expect(document.querySelector('[data-testid="parent-popup"]')).not.toBeNull();
    } finally {
        fixture.destroy();
    }
});
