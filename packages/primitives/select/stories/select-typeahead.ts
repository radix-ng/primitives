import { Component, input, signal } from '@angular/core';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { demoSelect } from '../../storybook/styles';
import { _importsSelect } from '../index';

@Component({
    selector: 'select-typeahead',
    imports: [_importsSelect, LucideCheck, LucideChevronDown],
    template: `
        <div class="grid w-80 max-w-full gap-3">
            <ng-container [(value)]="value" [items]="cities" rdxSelectRoot>
                <div class="text-sm font-medium" rdxSelectLabel>Destination</div>
                <button [class]="s.trigger" rdxSelectTrigger>
                    <span #display="rdxSelectedValue" rdxSelectValue>{{ display.slotText() }}</span>
                    <svg [class]="s.icon" lucideChevronDown size="16" aria-hidden="true" />
                </button>
                <ng-template [keepMounted]="keepMounted()" rdxSelectPortal>
                    <div [class]="s.positioner" sideOffset="6" rdxSelectPositioner>
                        <div [class]="s.popup" rdxSelectPopup>
                            <div class="max-h-64 overflow-y-auto" [class]="s.list" rdxSelectList>
                                @for (city of cities; track city.value) {
                                    <div
                                        [class]="s.item"
                                        [value]="city.value"
                                        [disabled]="city.disabled ?? false"
                                        rdxSelectItem
                                    >
                                        <span [class]="s.itemIndicator" rdxSelectItemIndicator aria-hidden="true">
                                            <svg [class]="s.icon" lucideCheck size="16" aria-hidden="true" />
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
    protected readonly s = demoSelect;
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
