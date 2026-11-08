import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { _importsSelect, RdxSelectItemGroup } from '../index';

@Component({
    selector: 'select-items',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [_importsSelect, LucideChevronDown],
    template: `
        <div class="flex max-w-sm flex-col gap-4">
            <div [(value)]="value" [multiple]="false" [items]="items" [highlightItemOnHover]="hover()" rdxSelectRoot>
                <button
                    class="border-border bg-background text-foreground focus-visible:ring-ring flex h-9 w-56 items-center justify-between rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                    aria-label="Preferred language"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a language">
                        {{ display.slotText() }}
                    </span>
                    <svg class="shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <div class="z-50" *rdxSelectPortal [sideOffset]="6" rdxSelectPositioner>
                    <div
                        class="border-border bg-popover text-popover-foreground w-56 rounded-md border p-1 shadow-md"
                        rdxSelectPopup
                    >
                        <div rdxSelectList>
                            @for (group of items; track group) {
                                <div rdxSelectGroup>
                                    @for (item of group.items; track item.value) {
                                        <div
                                            class="data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground flex h-8 cursor-default items-center gap-2 rounded-sm px-2 text-sm outline-none select-none"
                                            [value]="item.value"
                                            rdxSelectItem
                                        >
                                            <span rdxSelectItemText>{{ item.label }}</span>
                                            <span class="ml-auto" rdxSelectItemIndicator aria-hidden="true">✓</span>
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
