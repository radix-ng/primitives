# Autocomplete — Grid

> One example from the [Autocomplete](../components/autocomplete.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

An emoji picker: enable `grid` and wrap each row in `rdxAutocompleteRow` for two-dimensional arrow
navigation. The search input lives **inside** the popup (opened by the trigger) and auto-focuses on
open; pressing an item inserts it into the message field, and `onValueChange` is ignored when
`reason === 'item-press'` so the search box is not overwritten.

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { cn, demoCombobox, demoFocusRing } from '../../storybook/styles';
import { _importsAutocomplete } from '../index';

interface Emoji {
    emoji: string;
    name: string;
}

interface EmojiGroup {
    label: string;
    rows: Emoji[][];
}

const COLUMNS = 5;

function chunk<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        result.push(items.slice(i, i + size));
    }
    return result;
}

/**
 * Grid layout (an emoji picker). `grid` enables two-dimensional arrow navigation — Up/Down by row
 * (keeping the column), Left/Right within a row. The search `Input` lives **inside** the `Popup`
 * (opened by the `Trigger`) and auto-focuses on open. Pressing an emoji inserts it into the message
 * field; `onValueChange` is ignored when `reason === 'item-press'` so the search box is not overwritten.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-grid',
    imports: [_importsAutocomplete],
    template: `
        <div class="relative flex w-64">
            <input
                class="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring relative -mr-px h-9 flex-1 rounded-l-md border px-2 text-sm outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset"
                #message
                placeholder="Message…"
                aria-label="Message"
            />

            <div
                [(open)]="open"
                [value]="search()"
                (onValueChange)="onSearch($event)"
                (onOpenChangeComplete)="onOpenComplete($event)"
                grid
                rdxAutocompleteRoot
            >
                <button [class]="trigger" rdxAutocompleteTrigger rdxAutocompleteAnchor aria-label="Choose emoji">
                    😀
                </button>

                <div *rdxAutocompletePortal [class]="c.positioner" rdxAutocompletePositioner align="end">
                    <div [class]="popup" rdxAutocompletePopup>
                        <input
                            [class]="input"
                            rdxAutocompleteInput
                            placeholder="Search emojis…"
                            aria-label="Search emojis"
                        />
                        <div class="max-h-64 overflow-auto p-1">
                            @for (group of groups; track group.label) {
                                <div rdxAutocompleteGroup>
                                    <div [class]="c.groupLabel" rdxAutocompleteGroupLabel>
                                        {{ group.label }}
                                    </div>
                                    @for (row of group.rows; track $index) {
                                        <div class="grid grid-cols-5" rdxAutocompleteRow>
                                            @for (item of row; track item.emoji) {
                                                <div [class]="cell" [textValue]="item.name" rdxAutocompleteItem>
                                                    {{ item.emoji }}
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                        <div [class]="c.empty" rdxAutocompleteEmpty>No emoji found.</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteGrid {
    protected readonly c = demoCombobox;
    protected readonly trigger = cn(
        'border-border bg-background text-foreground relative inline-flex size-9 items-center justify-center rounded-r-md border text-lg',
        'hover:bg-muted data-[popup-open]:bg-muted',
        // The trigger is the focusable control here (`tabindex="0"`), so it carries the focus ring
        // itself; `z-10` lifts it above the adjoining message input so the ring isn't clipped.
        'focus-visible:z-10',
        demoFocusRing
    );
    protected readonly popup = cn(
        'border-border bg-popover text-popover-foreground z-50 mt-2 w-64 rounded-md border shadow-md',
        'data-[closed]:hidden'
    );
    protected readonly input = cn(
        'border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-t-md border-b px-2 text-sm',
        // Inset ring (no offset) so the search field's focus stays crisp against the popup's top edge.
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
    );
    protected readonly cell = cn(
        'flex h-10 cursor-default items-center justify-center rounded-sm text-xl outline-none',
        'data-[highlighted]:bg-muted data-[disabled]:opacity-50'
    );

    protected readonly message = viewChild<ElementRef<HTMLInputElement>>('message');

    readonly search = signal('');
    readonly open = signal(false);

    readonly groups: EmojiGroup[] = [
        {
            label: 'Smileys & Emotion',
            rows: chunk(
                [
                    { emoji: '😀', name: 'grinning face' },
                    { emoji: '😃', name: 'grinning face with big eyes' },
                    { emoji: '😄', name: 'grinning face with smiling eyes' },
                    { emoji: '😁', name: 'beaming face with smiling eyes' },
                    { emoji: '😆', name: 'grinning squinting face' },
                    { emoji: '😅', name: 'grinning face with sweat' },
                    { emoji: '🤣', name: 'rolling on the floor laughing' },
                    { emoji: '😂', name: 'face with tears of joy' },
                    { emoji: '🙂', name: 'slightly smiling face' },
                    { emoji: '🙃', name: 'upside-down face' },
                    { emoji: '😉', name: 'winking face' },
                    { emoji: '😊', name: 'smiling face with smiling eyes' },
                    { emoji: '😇', name: 'smiling face with halo' },
                    { emoji: '🥰', name: 'smiling face with hearts' },
                    { emoji: '😍', name: 'smiling face with heart-eyes' },
                    { emoji: '🤩', name: 'star-struck' },
                    { emoji: '😘', name: 'face blowing a kiss' },
                    { emoji: '😗', name: 'kissing face' },
                    { emoji: '☺️', name: 'smiling face' },
                    { emoji: '😚', name: 'kissing face with closed eyes' },
                    { emoji: '😙', name: 'kissing face with smiling eyes' },
                    { emoji: '🥲', name: 'smiling face with tear' },
                    { emoji: '😋', name: 'face savoring food' },
                    { emoji: '😛', name: 'face with tongue' },
                    { emoji: '😜', name: 'winking face with tongue' },
                    { emoji: '🤪', name: 'zany face' },
                    { emoji: '😝', name: 'squinting face with tongue' },
                    { emoji: '🤑', name: 'money-mouth face' },
                    { emoji: '🤗', name: 'hugging face' },
                    { emoji: '🤭', name: 'face with hand over mouth' }
                ],
                COLUMNS
            )
        },
        {
            label: 'Animals & Nature',
            rows: chunk(
                [
                    { emoji: '🐶', name: 'dog face' },
                    { emoji: '🐱', name: 'cat face' },
                    { emoji: '🐭', name: 'mouse face' },
                    { emoji: '🐹', name: 'hamster' },
                    { emoji: '🐰', name: 'rabbit face' },
                    { emoji: '🦊', name: 'fox' },
                    { emoji: '🐻', name: 'bear' },
                    { emoji: '🐼', name: 'panda' },
                    { emoji: '🐨', name: 'koala' },
                    { emoji: '🐯', name: 'tiger face' },
                    { emoji: '🦁', name: 'lion' },
                    { emoji: '🐮', name: 'cow face' },
                    { emoji: '🐷', name: 'pig face' },
                    { emoji: '🐽', name: 'pig nose' },
                    { emoji: '🐸', name: 'frog' },
                    { emoji: '🐵', name: 'monkey face' },
                    { emoji: '🙈', name: 'see-no-evil monkey' },
                    { emoji: '🙉', name: 'hear-no-evil monkey' },
                    { emoji: '🙊', name: 'speak-no-evil monkey' },
                    { emoji: '🐒', name: 'monkey' },
                    { emoji: '🐔', name: 'chicken' },
                    { emoji: '🐧', name: 'penguin' },
                    { emoji: '🐦', name: 'bird' },
                    { emoji: '🐤', name: 'baby chick' },
                    { emoji: '🐣', name: 'hatching chick' },
                    { emoji: '🐥', name: 'front-facing baby chick' },
                    { emoji: '🦆', name: 'duck' },
                    { emoji: '🦅', name: 'eagle' },
                    { emoji: '🦉', name: 'owl' },
                    { emoji: '🦇', name: 'bat' }
                ],
                COLUMNS
            )
        },
        {
            label: 'Food & Drink',
            rows: chunk(
                [
                    { emoji: '🍎', name: 'red apple' },
                    { emoji: '🍏', name: 'green apple' },
                    { emoji: '🍊', name: 'tangerine' },
                    { emoji: '🍋', name: 'lemon' },
                    { emoji: '🍌', name: 'banana' },
                    { emoji: '🍉', name: 'watermelon' },
                    { emoji: '🍇', name: 'grapes' },
                    { emoji: '🍓', name: 'strawberry' },
                    { emoji: '🫐', name: 'blueberries' },
                    { emoji: '🍈', name: 'melon' },
                    { emoji: '🍒', name: 'cherries' },
                    { emoji: '🍑', name: 'peach' },
                    { emoji: '🥭', name: 'mango' },
                    { emoji: '🍍', name: 'pineapple' },
                    { emoji: '🥥', name: 'coconut' },
                    { emoji: '🥝', name: 'kiwi fruit' },
                    { emoji: '🍅', name: 'tomato' },
                    { emoji: '🍆', name: 'eggplant' },
                    { emoji: '🥑', name: 'avocado' },
                    { emoji: '🥦', name: 'broccoli' },
                    { emoji: '🥬', name: 'leafy greens' },
                    { emoji: '🥒', name: 'cucumber' },
                    { emoji: '🌶️', name: 'hot pepper' },
                    { emoji: '🫑', name: 'bell pepper' },
                    { emoji: '🌽', name: 'ear of corn' },
                    { emoji: '🥕', name: 'carrot' },
                    { emoji: '🫒', name: 'olive' },
                    { emoji: '🧄', name: 'garlic' },
                    { emoji: '🧅', name: 'onion' },
                    { emoji: '🥔', name: 'potato' }
                ],
                COLUMNS
            )
        }
    ];

    private readonly emojiByName = new Map(
        this.groups.flatMap((group) => group.rows.flat()).map((item) => [item.name, item.emoji])
    );

    /** On selection (`item-press`) insert the emoji; otherwise update the search query. */
    onSearch(details: { value: string; reason: string }): void {
        if (details.reason === 'item-press') {
            const emoji = this.emojiByName.get(details.value);
            if (emoji) {
                this.insert(emoji);
            }
            return;
        }
        this.search.set(details.value);
    }

    private insert(emoji: string): void {
        const input = this.message()?.nativeElement;
        if (!input) {
            return;
        }
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
        const caret = start + emoji.length;
        input.setSelectionRange(caret, caret);
        // Focus the message field synchronously inside the `onValueChange` callback. The autocomplete
        // detects that the consumer moved focus and skips its own restoration, so this just works.
        input.focus();
        this.open.set(false);
    }

    /** Reset the search query once the popup has fully closed. */
    onOpenComplete(open: boolean): void {
        if (!open) {
            this.search.set('');
        }
    }
}
```
