# Composite

Low-level Base UI-style composite primitives. `CompositeList` owns DOM-order item registration and metadata;
`CompositeRoot` composes it with roving `tabindex` and delegated arrow-key focus movement.

## Features

- `CompositeList` registers items in DOM order and exposes an ordered metadata map.
- `CompositeRoot` keeps exactly one item in the tab order with `tabindex="0"`.
- Supports horizontal, vertical, and both-axis arrow navigation.
- Supports RTL horizontal navigation.
- Supports `disabledIndices`, matching Base UI semantics.
- Supports `Home` and `End` when enabled.
- Keeps native text input arrow behavior until the caret reaches an edge.
- Provides `relayKeyboardEvent` through context for detached popup scenarios.

## Import

```ts
import {
  RdxCompositeList,
  RdxCompositeListItem,
  RdxCompositeRoot,
  RdxCompositeItem,
} from '@radix-ng/primitives/composite';
```

## Anatomy

```html
<div rdxCompositeList>
  <button rdxCompositeListItem>One</button>
  <button rdxCompositeListItem>Two</button>
  <button rdxCompositeListItem>Three</button>
</div>

<div rdxCompositeRoot orientation="horizontal">
  <button rdxCompositeItem>One</button>
  <button rdxCompositeItem>Two</button>
  <button rdxCompositeItem>Three</button>
</div>
```

`CompositeRoot` composes `CompositeList`, so `rdxCompositeItem` also participates in ordered metadata
registration. Use `data-composite-item-active` on an item when it should provide the initial highlighted index.

## Examples

### Default

```typescript
import { cn, demoButton, demoInput } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';

@Component({
    selector: 'rdx-composite-default',
    imports: [RdxCompositeRoot, RdxCompositeItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-full max-w-xl flex-col gap-6">
            <div
                class="flex flex-wrap items-center gap-2"
                orientation="horizontal"
                enableHomeAndEndKeys
                highlightItemOnHover
                rdxCompositeRoot
            >
                <button data-composite-item-active rdxCompositeItem [class]="itemClass">Overview</button>
                <button rdxCompositeItem [class]="itemClass">Metrics</button>
                <button rdxCompositeItem [class]="itemClass">Reports</button>
            </div>

            <div
                class="flex w-full flex-wrap items-center gap-2"
                orientation="horizontal"
                rdxCompositeRoot
                [disabledIndices]="[2]"
                [loopFocus]="false"
            >
                <button rdxCompositeItem [class]="itemClass">Filter</button>
                <input rdxCompositeItem value="Search" [class]="inputClass" />
                <button aria-disabled="true" rdxCompositeItem [class]="itemClass">Archive</button>
                <button rdxCompositeItem [class]="itemClass">Export</button>
            </div>
        </div>
    `
})
export class RdxCompositeDefaultComponent {
    protected readonly itemClass = cn(
        demoButton.base,
        demoButton.outline,
        demoButton.size.md,
        'data-[composite-item-active]:border-primary'
    );
    protected readonly inputClass = cn(demoInput, 'max-w-40');
}
```

### List only

Use `CompositeList` when a primitive needs DOM-order registration and metadata without roving focus or
keyboard navigation.

```typescript
import { cn, demoButton, demoCard } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxCompositeList, RdxCompositeListItem, RdxCompositeMetadata } from '@radix-ng/primitives/composite';

@Component({
    selector: 'rdx-composite-list-only',
    imports: [RdxCompositeList, RdxCompositeListItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-full max-w-xl flex-col gap-4">
            <div class="flex flex-wrap items-center gap-2" rdxCompositeList (onMapChange)="onMapChange($event)">
                <button rdxCompositeListItem [class]="itemClass" [metadata]="{ id: 'overview', label: 'Overview' }">
                    Overview
                </button>
                <button rdxCompositeListItem [class]="itemClass" [metadata]="{ id: 'metrics', label: 'Metrics' }">
                    Metrics
                </button>
                <button rdxCompositeListItem [class]="itemClass" [metadata]="{ id: 'reports', label: 'Reports' }">
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
```

## API Reference

### RdxCompositeList

### RdxCompositeListItem

### RdxCompositeRoot

### RdxCompositeItem
