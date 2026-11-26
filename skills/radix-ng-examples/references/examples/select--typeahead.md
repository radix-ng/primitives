# Select — Typeahead

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Focus the closed trigger and type to select a matching option without opening the popup or moving
focus. Repeated initials cycle through matches; `new y` selects **New York**. Closed-trigger search
is available in single mode and skips disabled options. A disabled/read-only Select and a multiple
Select keep their values unchanged when typed into while closed.

In the open popup, typing changes only the highlight. Enter selects it; Space selects it when there
is no active search. During a query, Space continues the label, so multiword names remain searchable.
Open-popup search remains available in read-only and multiple modes without committing by itself.

Both modes use a 750ms session. Typing a value while closed keeps the prefix so later letters can
refine it. A query with no match clears immediately. Opening or closing the popup, leaving the control, a form
reset or an external Angular form write clears the session. An idle Space opens the closed popup.

Closed matches emit the usual cancelable `onValueChange` with reason `none` and update Angular Forms
through Root. They do not emit an open request or lock page scrolling. Option metadata loads only
when needed and stays hidden; temporary views are released after a pause or blur. Use the
`keepMounted` Storybook control to compare retained views. The `textValue` input provides an explicit
search alias; otherwise matching reads the current ItemText.

```typescript
import { Component, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxSelectItem,
    RdxSelectItemIndicator,
    RdxSelectItemText,
    RdxSelectLabel,
    RdxSelectList,
    RdxSelectPopup,
    RdxSelectPortal,
    RdxSelectPositioner,
    RdxSelectRoot,
    RdxSelectTrigger,
    RdxSelectValue
} from '@radix-ng/primitives/select';

@Component({
    selector: 'select-typeahead',
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
        LucideChevronDown
    ],
    template: `
        <div class="grid w-80 max-w-full gap-3">
            <ng-container [(value)]="value" [items]="cities" rdxSelectRoot>
                <div class="text-sm font-medium" rdxSelectLabel>Destination</div>
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div class="z-[100]" sideOffset="6" rdxSelectPositioner>
                        <div
                            class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                            rdxSelectPopup
                        >
                            <div class="max-h-64 overflow-y-auto p-1" rdxSelectList>
                                @for (city of cities; track city.value) {
                                    <div
                                        class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        [value]="city.value"
                                        [disabled]="city.disabled ?? false"
                                        rdxSelectItem
                                    >
                                        <span
                                            class="absolute start-0 inline-flex w-6 items-center justify-center"
                                            rdxSelectItemIndicator
                                            aria-hidden="true"
                                        >
                                            <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
                                        </span>
                                        <span rdxSelectItemText>{{ city.label }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground text-sm">
                Focus the button and type “new y” to select New York without opening. Press B repeatedly to cycle
                through Berlin and Bern.
            </p>
            <p class="text-muted-foreground text-sm">
                In the open list, typing only highlights a destination; Enter selects it. Pause briefly to start a new
                search. Tokyo is unavailable.
            </p>
            <output class="text-muted-foreground font-mono text-xs" data-testid="typeahead-value">
                Selected: {{ value() }}
            </output>
        </div>
    `
})
export class SelectTypeahead {
    readonly keepMounted = input(false);
    readonly value = signal<string | null | undefined>('amsterdam');
    readonly cities: readonly { value: string; label: string; disabled?: boolean }[] = [
        { value: 'amsterdam', label: 'Amsterdam' },
        { value: 'athens', label: 'Athens' },
        { value: 'austin', label: 'Austin' },
        { value: 'berlin', label: 'Berlin' },
        { value: 'bern', label: 'Bern' },
        { value: 'new-york', label: 'New York' },
        { value: 'newark', label: 'Newark' },
        { value: 'new-delhi', label: 'New Delhi' },
        { value: 'san-francisco', label: 'San Francisco' },
        { value: 'santa-fe', label: 'Santa Fe' },
        { value: 'tokyo', label: 'Tokyo', disabled: true }
    ];
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
