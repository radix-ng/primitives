# Select — Viewport edges and long lists

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

This example keeps the item-aligned trigger near an edge of the viewport. Use the `edge` and `dir`
controls to try top, middle, bottom and RTL layouts. Home and End reveal the first and last options,
including list padding. When scroll buttons change the list's height, Select keeps the keyboard
highlight visible after layout settles. Hovering an option does not scroll the list.

```typescript
import { Component, computed, input, signal, viewChild } from '@angular/core';
import { LucideCheck, LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import {
    RdxSelectArrow,
    RdxSelectItem,
    RdxSelectItemAlignedPosition,
    RdxSelectItemAlignedPositionContent,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectRoot,
    RdxSelectScrollDownButton,
    RdxSelectScrollUpButton,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'select-viewport-edges',
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectArrow,
        RdxSelectList,
        RdxSelectLabel,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectItemAlignedPosition,
        RdxSelectItemAlignedPositionContent,
        RdxSelectScrollUpButton,
        RdxSelectScrollDownButton,
        RdxDirectionProvider,
        LucideCheck,
        LucideChevronDown,
        LucideChevronUp
    ],
    host: { '(document:keydown)': 'closeShortcut($event)' },
    template: `
        <div class="text-muted-foreground max-w-64 text-sm">
            Open the list and press Home or End. The highlighted item stays visible when scroll buttons appear. F10
            closes the popup.
        </div>
        <div
            class="fixed start-8 grid w-64 gap-3"
            [class]="
                edge() === 'near-top'
                    ? '-top-6'
                    : edge() === 'bottom'
                      ? 'bottom-2'
                      : edge() === 'middle'
                        ? 'top-24'
                        : 'top-0'
            "
            [direction]="dir()"
            [attr.dir]="dir()"
            rdxDirectionProvider
        >
            <ng-container [(value)]="value" [defaultValue]="initial()" rdxSelectRoot>
                <div class="text-sm font-medium" rdxSelectLabel>Viewport edge</div>
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template
                    [container]="transformed() ? portalHost : undefined"
                    [keepMounted]="keepMounted()"
                    rdxSelectPortal
                >
                    <div class="z-[100]" rdxSelectItemAlignedPosition>
                        <div class="min-h-0 flex-1" data-testid="viewport-popup" rdxSelectPopup>
                            <div
                                class="demo-select-popup min-h-0 min-w-[var(--anchor-width,10rem)] flex-1 overflow-hidden will-change-[opacity,transform]"
                                [class]="capped() ? 'max-h-60' : ''"
                                rdxSelectItemAlignedPositionContent
                            >
                                @if (showArrow()) {
                                    <div class="text-popover demo-arrow my-px" rdxSelectArrow></div>
                                }
                                <div
                                    class="demo-select-scroll-button flex h-7 items-center justify-center"
                                    rdxSelectScrollUpButton
                                >
                                    <svg class="size-4 shrink-0" lucideChevronUp size="16" aria-hidden="true" />
                                </div>
                                <div class="min-h-0 p-1" rdxSelectList>
                                    @for (option of options; track option) {
                                        <div
                                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
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
                                    class="demo-select-scroll-button flex h-7 items-center justify-center"
                                    rdxSelectScrollDownButton
                                >
                                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        </div>
        <div
            #portalHost
            [class]="
                transformed()
                    ? 'border-border pointer-events-none fixed inset-8 translate-x-2 translate-y-2 border'
                    : 'contents'
            "
            data-testid="viewport-portal"
        ></div>
    `
})
export class SelectViewportEdges {
    private readonly root = viewChild(RdxSelectRoot);
    closeShortcut(event: KeyboardEvent) {
        if (event.key === 'F10') {
            event.preventDefault();
            this.root()?.close();
        }
    }
    readonly edge = input<'top' | 'middle' | 'bottom' | 'near-top'>('top');
    readonly initialIndex = input<number>();
    readonly capped = input(false);
    readonly transformed = input(false);
    readonly keepMounted = input(false);
    readonly showArrow = input(false);
    readonly dir = input<'ltr' | 'rtl'>('ltr');
    readonly options = Array.from({ length: 40 }, (_, i) => `Item ${String(i).padStart(2, '0')}`);
    readonly initial = computed(
        () => this.options[this.initialIndex() ?? (this.edge() === 'bottom' ? 38 : this.edge() === 'middle' ? 18 : 1)]
    );
    readonly value = signal<string | null | undefined>(undefined);
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
