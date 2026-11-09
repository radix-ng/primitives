# Select — Deferred unmount and imperative actions

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Use `#select="rdxSelectRoot"` or a `viewChild(RdxSelectRoot)` query to call `close()` and `unmount()`.
`close()` requests a cancelable close with reason `imperative-action` and returns whether it was
accepted. Calling it while already closed does nothing. These methods adapt Base UI's `actionsRef`
capabilities to Angular template references and view queries; a React ref object is unnecessary.

In an accepted closing `onOpenChange` event, call `eventDetails.preventUnmountOnClose()` to retain
the popup for an external animation. The logical `open` state still becomes `false`, and the popup
has `data-closed` / `data-ending-style`. Its positioner is inert while closed, so retained options do
not keep accepting selections. Finish the animation, then call `unmount()` to complete the closing
phase and release the portal. The example runs a Web Animations API exit and completes closing
automatically; **Finish exit** skips to the animation's end.

The opt-out belongs to that accepted close. A canceled request or an opening request cannot retain a
later close. A late call is accepted only while the same close is pending. Reopening clears it; a
stale `unmount()` while open does nothing. Cancel an old application animation on reopening so its
callback cannot finish a different, later close. Repeated `unmount()` calls do not repeat
`onOpenChangeComplete(false)`. Calling `close(); unmount()` in one batch is also supported.

Normal closing still waits for Presence to finish its CSS exit. Manual completion bypasses another
exit wait, and `onOpenChangeComplete(false)` runs once after the close finishes. Focus returns to the
trigger unless the user deliberately moved focus elsewhere.

`<ng-template rdxSelectPortal [keepMounted]="true">` retains the view even after closing completes.
Here `unmount()` ends the closing phase; it does not destroy a keep-mounted view. The positioner hides
after closing completes and stops tracking its anchor. Reopening reuses the view and resolves the
current selected item. Changing `keepMounted` is independent of the per-close animation opt-out.
The shared lifecycle is documented in
[ADR 0026](https://github.com/radix-ng/primitives/blob/main/docs/adr/0026-popup-close-lifecycle-and-presence.md).

```typescript
import { afterNextRender, Component, DestroyRef, effect, inject, Injector, signal, viewChild } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { cn, demoButton, demoSelect } from '../../storybook/styles';
import { _importsSelect, RdxSelectOpenChangeEvent, RdxSelectPopup, RdxSelectRoot } from '../index';

@Component({
    selector: 'select-deferred-unmount',
    imports: [_importsSelect, LucideCheck, LucideChevronDown, RdxFloatingInsideElement],
    template: `
        <div
            class="grid gap-8 sm:grid-cols-2"
            #select="rdxSelectRoot"
            [(open)]="open"
            [modal]="false"
            (onOpenChange)="onOpenChange($event)"
            (onOpenChangeComplete)="completions.update((events) => [...events, $event])"
            defaultValue="Apple"
            rdxSelectRoot
        >
            <div class="flex w-64 flex-col gap-2">
                <div class="text-foreground text-sm font-medium" rdxSelectLabel>Fruit</div>
                <button class="w-full" [class]="s.trigger" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div [class]="s.positioner" sideOffset="5" rdxSelectPositioner>
                        <div [class]="s.popup" rdxSelectPopup>
                            <div [class]="s.list" rdxSelectList>
                                @for (fruit of fruits; track fruit) {
                                    <div [class]="s.item" [value]="fruit" rdxSelectItem>
                                        <span [class]="s.itemIndicator" rdxSelectItemIndicator>
                                            <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                        </span>
                                        <span rdxSelectItemText>{{ fruit }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
                <output class="text-muted-foreground text-xs" data-testid="phase" aria-live="polite">
                    {{ open() ? 'Open' : select.transitionStatus() === 'ending' ? 'Closing' : 'Closed' }}
                </output>
                <output class="text-muted-foreground text-xs" data-testid="mounted">
                    {{ popup() ? 'Mounted' : 'Unmounted' }}
                </output>
            </div>

            <div class="grid w-64 gap-3 text-sm" rdxFloatingInside>
                <label class="flex items-center gap-2" for="select-defer-close">
                    <input
                        id="select-defer-close"
                        #deferInput
                        [checked]="defer()"
                        (change)="defer.set(deferInput.checked)"
                        type="checkbox"
                    />
                    Defer unmount
                </label>
                <label class="flex items-center gap-2" for="select-keep-mounted">
                    <input
                        id="select-keep-mounted"
                        #keepInput
                        [checked]="keepMounted()"
                        (change)="keepMounted.set(keepInput.checked)"
                        type="checkbox"
                    />
                    Keep mounted
                </label>
                <label class="flex items-center gap-2" for="select-cancel-close">
                    <input
                        id="select-cancel-close"
                        #cancelInput
                        [checked]="cancelNextClose()"
                        (change)="cancelNextClose.set(cancelInput.checked)"
                        type="checkbox"
                    />
                    Cancel next close
                </label>
                <div class="flex gap-2">
                    <button [class]="buttonClass" (click)="select.close()" type="button">Close</button>
                    <button [class]="buttonClass" (click)="finishExit()" type="button">Finish exit</button>
                </div>
                <p class="text-muted-foreground text-xs">
                    Close with Escape, a selection, or the Close action. The exit animation completes automatically;
                    Finish exit skips to its end. Cancel next close cancels one close request.
                </p>
                <output class="text-muted-foreground font-mono text-xs" data-testid="reason">{{ reason() }}</output>
                <output class="text-muted-foreground font-mono text-xs" data-testid="completions">
                    {{ completions().join(', ') || 'No completions' }}
                </output>
            </div>
        </div>
    `
})
export class SelectDeferredUnmount {
    protected readonly s = demoSelect;
    protected readonly buttonClass = cn(demoButton.base, demoButton.outline, demoButton.size.sm);
    readonly open = signal(false);
    readonly defer = signal(true);
    readonly keepMounted = signal(false);
    readonly cancelNextClose = signal(false);
    readonly reason = signal('No request');
    readonly completions = signal<boolean[]>([]);
    readonly fruits = ['Apple', 'Banana', 'Blueberry'];
    readonly popup = viewChild(RdxSelectPopup);
    private readonly root = viewChild(RdxSelectRoot);
    private readonly injector = inject(Injector);
    private animation: Animation | undefined;
    private generation = 0;

    constructor() {
        effect(() => {
            if (this.open()) this.cancelExit();
        });
        inject(DestroyRef).onDestroy(() => this.cancelExit());
    }

    onOpenChange(change: RdxSelectOpenChangeEvent): void {
        this.reason.set(change.eventDetails.reason);
        if (change.open) return;
        if (this.cancelNextClose()) {
            this.cancelNextClose.set(false);
            change.eventDetails.cancel();
            return;
        }
        if (!this.defer()) return;
        change.eventDetails.preventUnmountOnClose();
        this.cancelExit();
        const generation = this.generation;
        afterNextRender(
            () => {
                if (this.open() || generation !== this.generation) return;
                const element = this.popup()?.content();
                if (!element) return;
                const animation = element.animate(
                    [
                        { opacity: 1, transform: 'translateY(0)' },
                        { opacity: 0, transform: 'translateY(-6px)' }
                    ],
                    { duration: 400, easing: 'ease-out', fill: 'forwards' }
                );
                this.animation = animation;
                void animation.finished.then(
                    () => {
                        if (generation === this.generation) this.root()?.unmount();
                    },
                    () => undefined
                );
            },
            { injector: this.injector }
        );
    }

    finishExit(): void {
        if (this.animation) this.animation.finish();
        else this.root()?.unmount();
    }

    private cancelExit(): void {
        this.generation++;
        this.animation?.cancel();
        this.animation = undefined;
    }
}
```
