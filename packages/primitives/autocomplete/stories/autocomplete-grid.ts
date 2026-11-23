import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import {
    RdxAutocompleteAnchor,
    RdxAutocompleteEmpty,
    RdxAutocompleteGroup,
    RdxAutocompleteGroupLabel,
    RdxAutocompleteInput,
    RdxAutocompleteItem,
    RdxAutocompletePopup,
    RdxAutocompletePortal,
    RdxAutocompletePositioner,
    RdxAutocompleteRoot,
    RdxAutocompleteRow,
    RdxAutocompleteTrigger,
    type AutocompleteValueChangeDetails
} from '@radix-ng/primitives/autocomplete';

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
 * field; the consumer cancels the `item-press` value request and closes the popup so the search query
 * is not replaced by the emoji name.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'autocomplete-grid',
    imports: [
        RdxAutocompleteRoot,
        RdxAutocompleteAnchor,
        RdxAutocompleteInput,
        RdxAutocompleteTrigger,
        RdxAutocompletePortal,
        RdxAutocompletePositioner,
        RdxAutocompletePopup,
        RdxAutocompleteRow,
        RdxAutocompleteItem,
        RdxAutocompleteGroup,
        RdxAutocompleteGroupLabel,
        RdxAutocompleteEmpty
    ],
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
                <button
                    class="border-border bg-background text-foreground hover:bg-muted data-[popup-open]:bg-muted demo-focus relative inline-flex size-9 items-center justify-center rounded-r-md border text-lg focus-visible:z-10"
                    rdxAutocompleteTrigger
                    rdxAutocompleteAnchor
                    aria-label="Choose emoji"
                >
                    😀
                </button>

                <div
                    class="z-50 w-64 data-[closed]:pointer-events-none"
                    *rdxAutocompletePortal
                    rdxAutocompletePositioner
                    align="end"
                >
                    <div
                        class="border-border bg-popover text-popover-foreground z-50 mt-2 w-64 rounded-md border shadow-md data-[closed]:hidden"
                        rdxAutocompletePopup
                    >
                        <input
                            class="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-t-md border-b px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset"
                            rdxAutocompleteInput
                            placeholder="Search emojis…"
                            aria-label="Search emojis"
                        />
                        <div class="max-h-64 overflow-auto p-1">
                            @for (group of groups; track group.label) {
                                <div rdxAutocompleteGroup>
                                    <div class="demo-menu-group-label px-2 py-1.5" rdxAutocompleteGroupLabel>
                                        {{ group.label }}
                                    </div>
                                    @for (row of group.rows; track $index) {
                                        <div class="grid grid-cols-5" rdxAutocompleteRow>
                                            @for (item of row; track item.emoji) {
                                                <div
                                                    class="data-highlighted:bg-primary data-highlighted:text-primary-foreground flex h-10 cursor-default items-center justify-center rounded-sm text-xl outline-none data-[disabled]:opacity-50"
                                                    [textValue]="item.name"
                                                    rdxAutocompleteItem
                                                >
                                                    {{ item.emoji }}
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                        <div class="demo-combobox-empty data-[empty]:py-6" rdxAutocompleteEmpty>No emoji found.</div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AutocompleteGrid {
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
    onSearch(details: AutocompleteValueChangeDetails): void {
        if (details.reason === 'item-press') {
            details.eventDetails.cancel();
            this.open.set(false);
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
