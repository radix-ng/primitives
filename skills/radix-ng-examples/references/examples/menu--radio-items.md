# Menu — Radio items

> One example from the [Menu](../components/menu.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

A radio group selects exactly one option. Selecting an item keeps the menu open (`closeOnClick`
defaults to `false` for radio items). Bind `[(value)]` for controlled state or use `defaultValue` for
uncontrolled state. Values may be strings, numbers, objects, or other types and are compared by identity.
Set `disabled` on the group to disable all of its radio items. A nested `rdxMenuGroupLabel`
automatically labels the group through `aria-labelledby`.

`defaultValue` is an initial fallback only when `value` is `undefined`. Explicit values, including
`null`, `false` and `0`, take precedence. Later default changes are ignored even when the group
started without a default; they do not replace a user's selection. Use `[(value)]` for asynchronous
or live application values. Both models retain Angular's normal writable and two-way binding behavior.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'menu-radio-items-story',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>View</button>

            <div class="z-50 data-[closed]:pointer-events-none" *rdxMenuPortal sideOffset="4" rdxMenuPositioner>
                <div
                    class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                    rdxMenuPopup
                >
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50"
                        rdxMenuItem
                    >
                        Minimize window
                    </button>
                    <button
                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50"
                        rdxMenuItem
                    >
                        Zoom
                    </button>
                    <div class="bg-border -mx-1 my-1 h-px" rdxMenuSeparator></div>
                    <div [(value)]="selectedItem" rdxMenuRadioGroup>
                        @for (item of items(); track item) {
                            <label
                                class="demo-menu-selectable-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center py-1.5 ps-8 pe-2 data-[disabled]:opacity-50"
                                [value]="item"
                                rdxMenuRadioItem
                            >
                                <span
                                    class="pointer-events-none absolute start-2 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center"
                                    rdxMenuRadioItemIndicator
                                >
                                    ●
                                </span>
                                {{ item }}
                            </label>
                        }
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class MenuRadioItemsStory {
    readonly items = signal(['README.md', 'index.js', 'page.css']);
    selectedItem: string | undefined = undefined;
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
