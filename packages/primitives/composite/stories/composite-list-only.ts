import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxCompositeList, RdxCompositeListItem, RdxCompositeMetadata } from '@radix-ng/primitives/composite';
import { cn, demoButton, demoCard } from '../../storybook/styles';

@Component({
    selector: 'rdx-composite-list-only',
    imports: [RdxCompositeList, RdxCompositeListItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-full max-w-xl flex-col gap-4">
            <div class="flex flex-wrap items-center gap-2" (onMapChange)="onMapChange($event)" rdxCompositeList>
                <button [class]="itemClass" [metadata]="{ id: 'overview', label: 'Overview' }" rdxCompositeListItem>
                    Overview
                </button>
                <button [class]="itemClass" [metadata]="{ id: 'metrics', label: 'Metrics' }" rdxCompositeListItem>
                    Metrics
                </button>
                <button [class]="itemClass" [metadata]="{ id: 'reports', label: 'Reports' }" rdxCompositeListItem>
                    Reports
                </button>
            </div>

            <div [class]="panelClass">
                <div class="text-muted-foreground text-xs font-medium">Registered order</div>
                <ol class="text-foreground mt-2 grid gap-1 text-sm">
                    @for (item of orderedItems; track item.id) {
                        <li class="flex items-center justify-between gap-3">
                            <span>{{ item.label }}</span>
                            <span class="text-muted-foreground font-mono text-xs">index {{ item.index }}</span>
                        </li>
                    }
                </ol>
            </div>
        </div>
    `
})
export class RdxCompositeListOnlyComponent {
    protected orderedItems: Array<{ id: string; index: number; label: string }> = [];

    protected readonly itemClass = cn(demoButton.base, demoButton.outline, demoButton.size.md);
    protected readonly panelClass = cn(demoCard, 'p-4');

    protected onMapChange(map: Map<HTMLElement, RdxCompositeMetadata>) {
        this.orderedItems = Array.from(map.values()).map((item) => ({
            id: String(item['id']),
            index: item.index,
            label: String(item['label'])
        }));
    }
}
