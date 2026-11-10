# Popover — Close lifecycle and retained content

> One example from the [Popover](../components/popover.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Use the exported Root directly: `#root="rdxPopoverRoot"`, `root.close()` and `root.unmount()`.
Calling `close()` requests a cancelable close with reason `imperative-action`.
In `onOpenChange`, call `eventDetails.preventUnmountOnClose()` for an external exit animation,
then call `root.unmount()` when that animation finishes. The close completion fires once after
the pending exit finishes. A canceled request cannot hold a later close; reopening invalidates
the previous pending close. Calling `unmount()` while open or after completion does nothing.

Bind `[keepMounted]="true"` on an explicit `<ng-template rdxPopoverPortal>` to preserve the
Angular view and native input values. The Positioner and Backdrop hide after close completion;
the inactive focus scope and anchor tracking also stop. During an exit the popup remains rendered
with `data-ending-style`, while pointer events are disabled. Keyboard focus follows the browser
until completion or an intentional focus move. Reopening before the exit ends restores initial focus.

**Migration:** `root.close()` now reports `imperative-action` instead of `none`.
`onOpenChangeComplete(false)` waits for the portal's actual exit or explicit `unmount()`, including
a deferred close; consumers must not use an early close-completion event to finish that same hold.
Begin external animation in `onOpenChange`, then finish it through `unmount()`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { popoverImports, RdxPopoverOpenChange } from '@radix-ng/primitives/popover';
import { cn, demoButton, demoInput, demoPopover } from '../../storybook/styles';

@Component({
    selector: 'rdx-popover-lifecycle',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [...popoverImports, RdxFloatingInsideElement],
    template: `
        <section class="grid w-96 gap-4">
            <div class="flex flex-wrap gap-4 text-sm">
                <label class="flex items-center gap-2">
                    <input [checked]="defer()" (change)="defer.set($any($event.target).checked)" type="checkbox" />
                    Defer unmount
                </label>
                <label class="flex items-center gap-2">
                    <input [checked]="keep()" (change)="keep.set($any($event.target).checked)" type="checkbox" />
                    Keep mounted
                </label>
                <label class="flex items-center gap-2">
                    <input
                        [checked]="cancelNext()"
                        (change)="cancelNext.set($any($event.target).checked)"
                        type="checkbox"
                    />
                    Cancel next close
                </label>
            </div>
            <ng-container
                #root="rdxPopoverRoot"
                (onOpenChange)="change($event)"
                (onOpenChangeComplete)="complete($event)"
                rdxPopoverRoot
            >
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxPopoverTrigger>Edit note</button>
                <ng-template [keepMounted]="keep()" rdxPopoverPortal>
                    <div [class]="p.positioner" sideOffset="8" rdxPopoverPositioner>
                        <div [class]="cn(p.popup, p.popupAnimated, 'grid gap-3')" rdxPopoverPopup>
                            <h2 [class]="p.title" rdxPopoverTitle>Draft note</h2>
                            <p [class]="p.description" rdxPopoverDescription>
                                A retained portal preserves this native input's value.
                            </p>
                            <label class="grid gap-2 text-sm">
                                Note
                                <input [class]="input" value="draft" />
                            </label>
                            <button [class]="cn(b.base, b.outline, b.size.sm)" rdxPopoverClose>Close note</button>
                        </div>
                    </div>
                </ng-template>
                <div class="flex gap-2">
                    <button
                        [class]="cn(b.base, b.outline, b.size.sm)"
                        (click)="root.close()"
                        rdxFloatingInside
                        type="button"
                    >
                        Close
                    </button>
                    <button
                        [class]="cn(b.base, b.outline, b.size.sm)"
                        (click)="root.unmount()"
                        rdxFloatingInside
                        type="button"
                    >
                        Finish exit
                    </button>
                </div>
                <p class="text-muted-foreground text-sm" aria-live="polite">
                    {{ root.open() ? 'Open' : root.transitionStatus() === 'ending' ? 'Closing' : 'Closed' }}
                </p>
            </ng-container>
            <p class="text-muted-foreground text-sm">
                Enable defer unmount before opening, close the popup, then finish its exit. Keep mounted preserves the
                draft after closing.
            </p>
            <output class="text-muted-foreground text-sm">Completed: {{ completions().join(', ') || 'none' }}</output>
        </section>
    `
})
export class RdxPopoverLifecycleComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;
    protected readonly input = demoInput;
    protected readonly defer = signal(false);
    protected readonly keep = signal(false);
    protected readonly cancelNext = signal(false);
    protected readonly completions = signal<string[]>([]);
    protected change(change: RdxPopoverOpenChange) {
        if (change.open) return;
        if (this.cancelNext()) {
            change.eventDetails.cancel();
            this.cancelNext.set(false);
        }
        if (this.defer()) change.eventDetails.preventUnmountOnClose();
    }
    protected complete(open: boolean) {
        this.completions.update((values) => [...values, open ? 'open' : 'closed']);
    }
}
```
