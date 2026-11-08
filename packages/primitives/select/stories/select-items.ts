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
