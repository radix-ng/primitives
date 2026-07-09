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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { cn, demoButton, demoInput } from '../../storybook/styles';

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
                <button [class]="itemClass" data-composite-item-active rdxCompositeItem>Overview</button>
                <button [class]="itemClass" rdxCompositeItem>Metrics</button>
                <button [class]="itemClass" rdxCompositeItem>Reports</button>
            </div>

            <div
                class="flex w-full flex-wrap items-center gap-2"
                [disabledIndices]="[2]"
                [loopFocus]="false"
                orientation="horizontal"
                rdxCompositeRoot
            >
                <button [class]="itemClass" rdxCompositeItem>Filter</button>
                <input [class]="inputClass" rdxCompositeItem value="Search" />
                <button [class]="itemClass" aria-disabled="true" rdxCompositeItem>Archive</button>
                <button [class]="itemClass" rdxCompositeItem>Export</button>
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
```

### Reorder

Reordering items in place keeps roving focus correct: the tab stop and arrow-key navigation follow the new
document order even though the items are moved without re-registering.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import { cn, demoButton } from '../../storybook/styles';

/**
 * Demonstrates that roving focus keeps working after the items are reordered in
 * place. The list is driven by an `@for` tracked by a stable `id`, so reversing
 * the array makes Angular **reuse the views and move the DOM nodes** instead of
 * re-creating them — the composite item directives never re-register. A DOM-move
 * observer in the list is what keeps the index map (and roving tabindex) correct.
 */
@Component({
    selector: 'rdx-composite-reorder',
    imports: [RdxCompositeRoot, RdxCompositeItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-full max-w-xl flex-col items-start gap-4">
            <div class="flex flex-wrap items-center gap-2" orientation="horizontal" rdxCompositeRoot>
                @for (item of items(); track item.id) {
                    <button [class]="itemClass" [attr.data-testid]="item.id" rdxCompositeItem>
                        {{ item.label }}
                    </button>
                }
            </div>

            <button [class]="reorderClass" (click)="reverse()" type="button" data-testid="reorder">
                Reverse order
            </button>
        </div>
    `
})
export class RdxCompositeReorderComponent {
    protected readonly items = signal([
        { id: 'overview', label: 'Overview' },
        { id: 'metrics', label: 'Metrics' },
        { id: 'reports', label: 'Reports' },
        { id: 'settings', label: 'Settings' }
    ]);

    protected readonly itemClass = cn(demoButton.base, demoButton.outline, demoButton.size.md);
    protected readonly reorderClass = cn(demoButton.base, demoButton.primary, demoButton.size.sm);

    protected reverse(): void {
        this.items.update((current) => [...current].reverse());
    }
}
```

## API Reference

### RdxCompositeList

### RdxCompositeListItem

### RdxCompositeRoot

### RdxCompositeItem

`RdxCompositeItem` registers with the nearest `RdxCompositeRoot` and receives the roving `tabindex` from
the root's highlighted index. It forwards a single `metadata` input to the composed `RdxCompositeListItem`
(see above) and has no inputs of its own.
