import { Component, signal } from '@angular/core';
import {
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab,
    type RdxTabsValueChangeEvent
} from '@radix-ng/primitives/tabs';
import { cn, demoButton } from '../../storybook/styles';

@Component({
    selector: 'tabs-object-values-example',
    imports: [RdxTabsRoot, RdxTabsList, RdxTabsTab, RdxTabsPanel, RdxTabsPanelPresence],
    template: `
        <div class="grid w-80 gap-3" [value]="selected()" (onValueChange)="change($event)" rdxTabsRoot>
            <div class="flex gap-2" aria-label="Workspace sections" rdxTabsList>
                @for (section of sections; track section) {
                    <button [class]="tabClass" [value]="section" rdxTabsTab>{{ section.label }}</button>
                }
            </div>
            @for (section of sections; track section) {
                <div class="border-border rounded border p-4" *rdxTabsPanelPresence="section" rdxTabsPanel>
                    {{ section.description }}
                </div>
            }
            <output class="text-muted-foreground text-sm">Selected: {{ selected().label }}</output>
        </div>
    `
})
export class TabsObjectValuesExample {
    readonly sections = [
        { label: 'Account', description: 'Manage your account.' },
        { label: 'Security', description: 'Update your security preferences.' }
    ];
    readonly selected = signal(this.sections[0]);
    readonly tabClass = cn(
        demoButton.base,
        demoButton.ghost,
        demoButton.size.sm,
        'data-active:bg-primary data-active:text-primary-foreground'
    );

    change({ value }: RdxTabsValueChangeEvent) {
        const section = this.sections.find((section) => section === value);
        if (section) this.selected.set(section);
    }
}
