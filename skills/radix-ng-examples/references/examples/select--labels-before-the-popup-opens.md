# Select — Labels before the popup opens

> One example from the [Select](../components/select.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.3.0` — if the installed version differs, verify the API against the installed package.

Pass `items` to Root as a record (`{ fr: 'France' }`), an array of `{ value, label }` descriptors, or
an array of groups with an `items` array. These provide text labels for `rdxSelectValue` before the
popup mounts and after it closes. They do not render the options; the template still owns the list.
The Angular label type is `string | number | null | undefined`; rich markup belongs in the template.

`itemToStringLabel` takes precedence for non-null values, followed by an object's explicit `label`.
Records match the value as a property key. Descriptor arrays match primitive values directly, or
an object's `value` property; they do not use the selection comparator to resolve arbitrary objects.
Use `itemToStringLabel` for objects such as `{ code, name }`.

A null option with a label in `items` overrides the placeholder. Numeric zero and empty text labels
are preserved. `[highlightItemOnHover]="false"` keeps keyboard highlighting independent of pointer
movement and pointer leave; clicking an item still selects it. The default is `true`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
import { _importsSelect, RdxSelectItemGroup } from '../index';

@Component({
    selector: 'select-items',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [_importsSelect, LucideCheck, LucideChevronDown],
    template: `
        <div class="flex max-w-sm flex-col gap-4">
            <div [(value)]="value" [multiple]="false" [items]="items" [highlightItemOnHover]="hover()" rdxSelectRoot>
                <button class="w-56" [class]="s.trigger" aria-label="Preferred language" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a language">
                        {{ display.slotText() }}
                    </span>
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <div *rdxSelectPortal [class]="s.positioner" [sideOffset]="6" rdxSelectPositioner>
                    <div [class]="s.popup" rdxSelectPopup>
                        <div [class]="s.list" rdxSelectList>
                            @for (group of items; track group) {
                                <div rdxSelectGroup>
                                    @for (item of group.items; track item.value) {
                                        <div [class]="s.item" [value]="item.value" rdxSelectItem>
                                            <span rdxSelectItemText>{{ item.label }}</span>
                                            <span [class]="s.itemIndicator" rdxSelectItemIndicator aria-hidden="true">
                                                <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
                                            </span>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <label class="text-foreground flex items-center gap-2 text-sm" for="select-hover">
                <input
                    id="select-hover"
                    #toggle
                    [checked]="hover()"
                    (change)="hover.set(toggle.checked)"
                    type="checkbox"
                />
                Highlight items on hover
            </label>
            <p class="text-muted-foreground text-sm">Labels are available before the popup opens.</p>
            <output class="text-muted-foreground font-mono text-xs" data-testid="language-value">
                {{ value() ?? 'none' }}
            </output>
        </div>
    `
})
export class SelectItems {
    protected readonly s = demoSelect;

    readonly value = signal<string | null | undefined>('fr');
    readonly hover = signal(false);
    readonly items: readonly RdxSelectItemGroup<string>[] = [
        {
            items: [
                { value: null, label: 'No preference' },
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' }
            ]
        }
    ];
}
```
