import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import {
    RdxSelectGroup,
    RdxSelectItem,
    RdxSelectItemGroup,
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

@Component({
    selector: 'select-items',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxSelectRoot,
        RdxSelectPortal,
        RdxSelectTrigger,
        RdxSelectValue,
        RdxSelectPopup,
        RdxSelectList,
        RdxSelectItemIndicator,
        RdxSelectItem,
        RdxSelectItemText,
        RdxSelectGroup,
        RdxSelectPositioner,
        LucideCheck,
        LucideChevronDown
    ],
    template: `
        <div class="flex max-w-sm flex-col gap-4">
            <div [(value)]="value" [multiple]="false" [items]="items" [highlightItemOnHover]="hover()" rdxSelectRoot>
                <button
                    class="demo-select-trigger data-[placeholder]:text-muted-foreground data-[invalid]:border-destructive data-[invalid]:aria-invalid:ring-destructive/30 demo-focus inline-flex min-h-9 w-56 items-center justify-between gap-2 px-3 py-1.5 disabled:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                    aria-label="Preferred language"
                    rdxSelectTrigger
                >
                    <span #display="rdxSelectedValue" rdxSelectValue placeholder="Choose a language">
                        {{ display.slotText() }}
                    </span>
                    <svg class="size-4 shrink-0" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <div class="z-[100]" *rdxSelectPortal [sideOffset]="6" rdxSelectPositioner>
                    <div
                        class="demo-select-popup min-w-[var(--anchor-width,10rem)] will-change-[opacity,transform]"
                        rdxSelectPopup
                    >
                        <div class="p-1" rdxSelectList>
                            @for (group of items; track group) {
                                <div rdxSelectGroup>
                                    @for (item of group.items; track item.value) {
                                        <div
                                            class="demo-select-item data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:text-muted-foreground relative flex min-h-7 items-center gap-2 ps-6 pe-8 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                            [value]="item.value"
                                            rdxSelectItem
                                        >
                                            <span rdxSelectItemText>{{ item.label }}</span>
                                            <span
                                                class="absolute start-0 inline-flex w-6 items-center justify-center"
                                                rdxSelectItemIndicator
                                                aria-hidden="true"
                                            >
                                                <svg class="size-4 shrink-0" lucideCheck size="16" aria-hidden="true" />
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
