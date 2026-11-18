import { afterNextRender, Component, DestroyRef, effect, inject, Injector, signal, viewChild } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { RdxFloatingInsideElement } from '@radix-ng/primitives/dismissable-layer';
import { RdxPresenceTarget } from '@radix-ng/primitives/presence';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectOpenChangeEvent,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'select-deferred-unmount',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectPositioner,
        LucideCheck,
        LucideChevronDown,
        RdxFloatingInsideElement,
        RdxPresenceTarget
    ],
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
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-full items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div class="z-[100]" sideOffset="5" rdxSelectPositioner>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            rdxSelectPopup
                        >
                            <div class="p-1" rdxSelectList rdxPresenceTarget>
                                @for (fruit of fruits; track fruit) {
                                    <div
                                        class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="fruit"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute start-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                        >
                                            <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
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
                    <button
                        class="demo-button demo-button-outline h-8 px-3 text-xs"
                        (click)="select.close()"
                        type="button"
                    >
                        Close
                    </button>
                    <button
                        class="demo-button demo-button-outline h-8 px-3 text-xs"
                        (click)="finishExit()"
                        type="button"
                    >
                        Finish exit
                    </button>
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
