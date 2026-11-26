# Select — Live layout and anchor tracking

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Anchored Select follows ancestor scrolling, trigger resizing and transforms. `disableAnchorTracking`
opts out of those updates; it still measures on opening and responds to window resize. Use anchored
mode when the popup needs to follow a moving trigger.

Item alignment defaults to disabled anchor tracking and retains its opening position. Explicit
`disableAnchorTracking="false"` refreshes anchor metrics and CSS variables, while the manual item
coordinates still remain fixed for that opening, matching the pinned Base UI behavior. Reopening
measures the current trigger, selection and consumer CSS. CSS `scale()` on the trigger is supported;
scaled or transformed portal containers use the common anchored fallback.

`data-anchor-hidden` reports clipping independently of popup visibility. Set `hideWhenDetached` to
hide the popup while its anchor is fully clipped. The state does not itself close Select or change
its value. Both positioners use 5px viewport collision padding by default.

Use the controls before opening, or F2/F3/F4/F6 while the list owns focus. The scrollable example
also lets you move the trigger out of its container and back.

```typescript
import { Component, computed, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import {
    RdxSelectItem,
    RdxSelectItemAlignedPosition,
    RdxSelectItemAlignedPositionContent,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectScrollDownButton,
    RdxSelectScrollUpButton,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'select-live-layout',
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
        RdxSelectItemAlignedPosition,
        RdxSelectItemAlignedPositionContent,
        RdxSelectScrollUpButton,
        RdxSelectScrollDownButton,
        LucideCheck,
        LucideChevronDown,
        LucideChevronUp
    ],
    host: { '(document:keydown)': 'onCommand($event)' },
    template: `
        <p class="text-muted-foreground max-w-96 text-sm">
            Open the list, then use F2 to change width, F3 for taller rows, F4 to scale the trigger, and F6 to move it.
            Anchored mode follows the trigger; item alignment keeps its opening position.
        </p>
        <div
            [class]="scrollable() ? 'border-border fixed start-4 top-16 h-80 w-96 overflow-auto border' : 'contents'"
            data-testid="live-scroller"
        >
            <form
                class="grid w-64 gap-3"
                [class]="(scrollable() ? 'm-16' : 'fixed start-8 top-32') + formClass()"
                (submit)="$event.preventDefault()"
            >
                <ng-container [(value)]="value" [modal]="false" rdxSelectRoot>
                    <div class="text-sm font-medium" rdxSelectLabel>Destination</div>
                    <button
                        class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                        rdxSelectTrigger
                    >
                        <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                        <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                    </button>
                    <ng-template [container]="portalScale() ? portalHost : undefined" rdxSelectPortal>
                        @if (aligned()) {
                            <div
                                class="z-[100]"
                                [disableAnchorTracking]="disableTracking()"
                                sideOffset="5"
                                rdxSelectItemAlignedPosition
                            >
                                <div class="min-h-0 flex-1" rdxSelectPopup>
                                    <div
                                        class="demo-select-popup min-h-0 min-w-[var(--anchor-width,10rem)] flex-1 overflow-hidden will-change-[opacity,transform]"
                                        [class]="heightClass()"
                                        rdxSelectItemAlignedPositionContent
                                    >
                                        <div
                                            class="demo-select-scroll-button absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-center"
                                            rdxSelectScrollUpButton
                                        >
                                            <svg class="size-4 shrink-0" lucideChevronUp size="16" aria-hidden="true" />
                                        </div>
                                        <div class="min-h-0 p-1" rdxSelectList>
                                            @for (option of options; track option) {
                                                <div
                                                    class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                    [class]="tall() ? 'py-4!' : ''"
                                                    [value]="option"
                                                    rdxSelectItem
                                                >
                                                    <span
                                                        class="absolute start-0 inline-flex w-6 items-center justify-center"
                                                        rdxSelectItemIndicator
                                                        aria-hidden="true"
                                                    >
                                                        <svg class="size-4 shrink-0" lucideCheck size="16" />
                                                    </span>
                                                    <span rdxSelectItemText>{{ option }}</span>
                                                </div>
                                            }
                                        </div>
                                        <div
                                            class="demo-select-scroll-button absolute inset-x-0 bottom-0 z-10 flex h-7 items-center justify-center"
                                            rdxSelectScrollDownButton
                                        >
                                            <svg
                                                class="size-4 shrink-0"
                                                lucideChevronDown
                                                size="16"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        } @else {
                            <div
                                class="z-[100]"
                                [disableAnchorTracking]="disableTracking()"
                                [hideWhenDetached]="hideWhenDetached()"
                                sideOffset="5"
                                align="start"
                                rdxSelectPositioner
                            >
                                <div
                                    class="demo-select-popup flex min-h-0 min-w-[var(--anchor-width,10rem)] flex-col overflow-hidden will-change-[opacity,transform]"
                                    [class]="heightClass()"
                                    rdxSelectPopup
                                >
                                    <div
                                        class="demo-select-scroll-button absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-center"
                                        rdxSelectScrollUpButton
                                    >
                                        <svg class="size-4 shrink-0" lucideChevronUp size="16" aria-hidden="true" />
                                    </div>
                                    <div class="min-h-0 p-1" rdxSelectList>
                                        @for (option of options; track option) {
                                            <div
                                                class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                                [class]="tall() ? 'py-4!' : ''"
                                                [value]="option"
                                                rdxSelectItem
                                            >
                                                <span
                                                    class="absolute start-0 inline-flex w-6 items-center justify-center"
                                                    rdxSelectItemIndicator
                                                    aria-hidden="true"
                                                >
                                                    <svg class="size-4 shrink-0" lucideCheck size="16" />
                                                </span>
                                                <span rdxSelectItemText>{{ option }}</span>
                                            </div>
                                        }
                                    </div>
                                    <div
                                        class="demo-select-scroll-button absolute inset-x-0 bottom-0 z-10 flex h-7 items-center justify-center"
                                        rdxSelectScrollDownButton
                                    >
                                        <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                                    </div>
                                </div>
                            </div>
                        }
                    </ng-template>
                </ng-container>
            </form>
            @if (scrollable()) {
                <div class="h-[600px]" aria-hidden="true"></div>
            }
        </div>
        <div class="fixed start-8 bottom-8 flex max-w-96 flex-wrap gap-2 text-xs">
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="wide()"
                (click)="wide.set(!wide())"
            >
                Width (F2)
            </button>
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="tall()"
                (click)="tall.set(!tall())"
            >
                Rows (F3)
            </button>
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="scaled()"
                (click)="scaled.set(!scaled())"
            >
                Scale (F4)
            </button>
            <button
                class="border-border bg-background rounded border px-3 py-2"
                [attr.aria-pressed]="moved()"
                (click)="moved.set(!moved())"
            >
                Move (F6)
            </button>
        </div>
        <div
            #portalHost
            [class]="portalScale() ? 'pointer-events-none fixed inset-8 origin-top-left scale-110' : 'contents'"
            data-testid="live-portal"
        ></div>
    `
})
export class SelectLiveLayout {
    readonly aligned = input(false);
    readonly tracking = input<'auto' | 'on' | 'off'>('auto');
    readonly portalScale = input(false);
    readonly hideWhenDetached = input(false);
    readonly scrollable = input(false);
    readonly disableTracking = computed(() => (this.tracking() === 'auto' ? undefined : this.tracking() === 'off'));
    readonly wide = signal(false);
    readonly tall = signal(false);
    readonly scaled = signal(false);
    readonly moved = signal(false);
    readonly value = signal<string | null>('Item 18');
    readonly options = Array.from({ length: 40 }, (_, i) => `Item ${String(i).padStart(2, '0')}`);
    readonly formClass = computed(
        () =>
            (this.wide() ? ' w-80!' : '') +
            (this.scaled() ? ' origin-top-left scale-125' : '') +
            (this.moved() ? ' translate-x-12 translate-y-8' : '')
    );
    readonly heightClass = computed(() =>
        this.aligned()
            ? ' data-[side=top]:max-h-[var(--available-height)] data-[side=bottom]:max-h-[var(--available-height)]'
            : ' max-h-[var(--available-height)]'
    );
    onCommand(event: KeyboardEvent) {
        const target = (
            { F2: this.wide, F3: this.tall, F4: this.scaled, F6: this.moved } as Record<string, typeof this.wide>
        )[event.key];
        if (!target) return;
        event.preventDefault();
        target.update((value) => !value);
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.

#### `./select-typed-control.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    provideRdxSelectRoot,
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

/** Application-owned markup; all state, events and form bindings are inherited from the primitive. */
@Component({
    selector: 'example-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideRdxSelectRoot(SelectTypedControl)],
    imports: [
        LucideCheck,
        LucideChevronDown,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPortal,
        RdxSelectPositioner,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemIndicator
    ],
    template: `
        <button
            class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-64 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            rdxSelectTrigger
        >
            <span #display="rdxSelectedValue" [placeholder]="placeholder()" rdxSelectValue>
                {{ display.slotText() }}
            </span>
            <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
        </button>
        <div class="z-[100]" *rdxSelectPortal [sideOffset]="4" align="start" rdxSelectPositioner>
            <div
                class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                rdxSelectPopup
            >
                <div class="p-1" rdxSelectList>
                    @for (option of options(); track option) {
                        <div
                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            [value]="option"
                            rdxSelectItem
                        >
                            <span
                                class="absolute start-0 inline-flex w-6 items-center justify-center"
                                aria-hidden="true"
                                rdxSelectItemIndicator
                            >
                                <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                            </span>
                            <span rdxSelectItemText>{{ itemToStringLabel()?.(option) ?? option }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class SelectTypedControl<Value = unknown, Multiple extends boolean = false> extends RdxSelectRoot<
    Value,
    Multiple
> {
    readonly options = input.required<readonly Value[]>();
    readonly placeholder = input('Select an option');
}
```
