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

<a href="../guides/styling.md#copy-an-example-into-your-app" target="_top">Example setup</a>

### Default

```typescript
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
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    data-composite-item-active
                    rdxCompositeItem
                >
                    Overview
                </button>
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Metrics
                </button>
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Reports
                </button>
            </div>

            <div
                class="flex w-full flex-wrap items-center gap-2"
                [disabledIndices]="[2]"
                [loopFocus]="false"
                orientation="horizontal"
                rdxCompositeRoot
            >
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Filter
                </button>
                <input class="demo-input h-9 w-full max-w-40 px-3" rdxCompositeItem value="Search" />
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    aria-disabled="true"
                    rdxCompositeItem
                >
                    Archive
                </button>
                <button
                    class="demo-button demo-button-outline data-[composite-item-active]:border-primary h-9 px-4"
                    rdxCompositeItem
                >
                    Export
                </button>
            </div>
        </div>
    `
})
export class RdxCompositeDefaultComponent {}
```

### List only

Use `CompositeList` when a primitive needs DOM-order registration and metadata without roving focus or
keyboard navigation.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxCompositeList, RdxCompositeListItem, RdxCompositeMetadata } from '@radix-ng/primitives/composite';

@Component({
    selector: 'rdx-composite-list-only',
    imports: [RdxCompositeList, RdxCompositeListItem],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex w-full max-w-xl flex-col gap-4">
            <div class="flex flex-wrap items-center gap-2" (onMapChange)="onMapChange($event)" rdxCompositeList>
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    [metadata]="{ id: 'overview', label: 'Overview' }"
                    rdxCompositeListItem
                >
                    Overview
                </button>
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    [metadata]="{ id: 'metrics', label: 'Metrics' }"
                    rdxCompositeListItem
                >
                    Metrics
                </button>
                <button
                    class="demo-button demo-button-outline h-9 px-4"
                    [metadata]="{ id: 'reports', label: 'Reports' }"
                    rdxCompositeListItem
                >
                    Reports
                </button>
            </div>

            <div class="demo-surface p-4">
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
                    <button
                        class="demo-button demo-button-outline h-9 px-4"
                        [attr.data-testid]="item.id"
                        rdxCompositeItem
                    >
                        {{ item.label }}
                    </button>
                }
            </div>

            <button
                class="demo-button demo-button-primary h-8 px-3 text-xs"
                (click)="reverse()"
                type="button"
                data-testid="reorder"
            >
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
