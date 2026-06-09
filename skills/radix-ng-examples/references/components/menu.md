# Menu

#### A headless dropdown menu anchored to a trigger button.

Menu composes the shared Popper, Dismissable Layer, and Focus Scope primitives. It remains fully
headless — state is exposed through `data-*` attributes and the consumer provides all visual styles.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
  selector: 'rdx-menu-default',
  imports: [RdxMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #root="rdxMenuRoot" rdxMenuRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>File</button>

      @if (root.open()) {
        <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
          <div [class]="m.popup" rdxMenuPopup>
            <button [class]="m.item" rdxMenuItem>New Tab</button>
            <button [class]="m.item" rdxMenuItem>New Window</button>
            <button [class]="m.item" [disabled]="true" rdxMenuItem>New Private Window</button>
            <div [class]="m.separator" rdxMenuSeparator></div>
            <button [class]="m.item" rdxMenuItem>Save Page As…</button>
            <button [class]="m.item" rdxMenuItem>Print…</button>
          </div>
        </div>
      }
    </ng-container>
  `
})
export class RdxMenuDefaultComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly m = demoMenu;
}
```

## Features

- ✅ Opens and closes from a trigger button with click or arrow-key interaction.
- ✅ Supports uncontrolled state, `defaultOpen`, and two-way binding with `[(open)]`.
- ✅ Positions the popup with the shared Floating UI-based Popper primitive.
- ✅ Optional visual arrow connecting the popup to its trigger (`rdxMenuArrow`).
- ✅ Optional backdrop overlay behind the popup (`rdxMenuBackdrop`).
- ✅ Closes on Escape (restoring focus to the trigger), outside pointer interaction, and Tab.
- ✅ Full keyboard navigation: ArrowDown, ArrowUp, Home, End, and character typeahead.
- ✅ Focus loop at list boundaries, configurable with `loopFocus`.
- ✅ Skips disabled items during keyboard navigation.
- ✅ `closeOnClick` per item — defaults to `true` for regular items, `false` for checkbox, radio, and link items.
- ✅ Checkbox items toggle state independently; radio groups enforce single selection.
- ✅ Grouped items with optional group labels and visual separators.
- ✅ Nested submenus via `rdxMenuSubTrigger` — opens on hover (200 ms delay), click, or ArrowRight; closes on ArrowLeft.
- ✅ CSS transition lifecycle via `data-starting-style` / `data-ending-style` and `(onOpenChangeComplete)`.
- ✅ All collision, side, and alignment metadata exposed via `data-side` / `data-align`.
- ✅ `data-highlighted` on the focused item and `data-disabled` on disabled items.

## Import

```typescript
import {
  RdxMenuArrow,
  RdxMenuBackdrop,
  RdxMenuCheckboxItem,
  RdxMenuCheckboxItemIndicator,
  RdxMenuGroup,
  RdxMenuGroupLabel,
  RdxMenuItem,
  RdxMenuLinkItem,
  RdxMenuPopup,
  RdxMenuPortal,
  RdxMenuPositioner,
  RdxMenuRadioGroup,
  RdxMenuRadioItem,
  RdxMenuRadioItemIndicator,
  RdxMenuRoot,
  RdxMenuSeparator,
  RdxMenuSubTrigger,
  RdxMenuTrigger
} from '@radix-ng/primitives/menu';
```

Or import all parts through the module:

```typescript
import { RdxMenuModule } from '@radix-ng/primitives/menu';
```

## Anatomy

Apply the directives to your own markup. Use `@if (root.open())` to conditionally mount the popup
so it is removed from the DOM when closed.

```html
<ng-container #root="rdxMenuRoot" rdxMenuRoot>
  <button rdxMenuTrigger>Open</button>

  <!-- optional backdrop — place before the positioner -->
  @if (root.open()) {
  <div rdxMenuBackdrop></div>
  } @if (root.open()) {
  <div sideOffset="4" rdxMenuPositioner>
    <div rdxMenuPopup>
      <span rdxMenuArrow></span>

      <!-- regular item -->
      <button rdxMenuItem>New Tab</button>

      <!-- link item — does not close by default -->
      <a rdxMenuLinkItem href="/settings">Settings</a>

      <div rdxMenuSeparator></div>

      <!-- checkbox item — does not close the menu -->
      <label rdxMenuCheckboxItem>
        <span rdxMenuCheckboxItemIndicator></span>
        Show Bookmarks
      </label>

      <!-- radio group — items do not close the menu by default -->
      <div rdxMenuRadioGroup>
        <label value="grid" rdxMenuRadioItem>
          <span rdxMenuRadioItemIndicator></span>
          Grid View
        </label>
        <label value="list" rdxMenuRadioItem>
          <span rdxMenuRadioItemIndicator></span>
          List View
        </label>
      </div>

      <div rdxMenuSeparator></div>

      <!-- group with a label -->
      <div rdxMenuGroup>
        <span rdxMenuGroupLabel>Section</span>
        <button rdxMenuItem>Item</button>
      </div>

      <div rdxMenuSeparator></div>

      <!-- submenu: wrap trigger + popup in a nested rdxMenuRoot -->
      <ng-container #sub="rdxMenuRoot" rdxMenuRoot>
        <button rdxMenuSubTrigger>More options ›</button>

        @if (sub.open()) {
        <div side="right" align="start" sideOffset="4" rdxMenuPositioner>
          <div rdxMenuPopup>
            <button rdxMenuItem>Sub item A</button>
            <button rdxMenuItem>Sub item B</button>
          </div>
        </div>
        }
      </ng-container>
    </div>
  </div>
  }
</ng-container>
```

## Examples

### Default

A basic dropdown with regular items, a disabled item, and a separator.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
  selector: 'rdx-menu-default',
  imports: [RdxMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #root="rdxMenuRoot" rdxMenuRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>File</button>

      @if (root.open()) {
        <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
          <div [class]="m.popup" rdxMenuPopup>
            <button [class]="m.item" rdxMenuItem>New Tab</button>
            <button [class]="m.item" rdxMenuItem>New Window</button>
            <button [class]="m.item" [disabled]="true" rdxMenuItem>New Private Window</button>
            <div [class]="m.separator" rdxMenuSeparator></div>
            <button [class]="m.item" rdxMenuItem>Save Page As…</button>
            <button [class]="m.item" rdxMenuItem>Print…</button>
          </div>
        </div>
      }
    </ng-container>
  `
})
export class RdxMenuDefaultComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly m = demoMenu;
}
```

### Radio items

A radio group selects exactly one option. Selecting an item keeps the menu open (`closeOnClick`
defaults to `false` for radio items). Bind `[(value)]` on `rdxMenuRadioGroup` for controlled state.

```html
<menu-radio-items-story />
```

### Checkbox items

Checkbox items toggle their state without closing the menu (`closeOnClick` defaults to `false`). An
indeterminate state is supported when only some items in a related set are selected.

```html
<menu-checkbox-items-story />
```

### With labels

Group items visually and semantically with `rdxMenuGroup` and label them with `rdxMenuGroupLabel`.
Disabled items are skipped by keyboard navigation and styled via `data-disabled`.

```html
<menu-with-labels-items-story />
```

### Nested submenus

Wrap a `rdxMenuSubTrigger` and its popup inside a nested `ng-container rdxMenuRoot`. The subtrigger
opens the submenu on hover (200 ms delay), click, or ArrowRight; ArrowLeft closes it and returns
focus to the subtrigger.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
  selector: 'rdx-menu-nested',
  imports: [RdxMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #root="rdxMenuRoot" rdxMenuRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Edit</button>

      @if (root.open()) {
        <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
          <div [class]="m.popup" rdxMenuPopup>
            <button [class]="m.item" rdxMenuItem>Undo</button>
            <button [class]="m.item" rdxMenuItem>Redo</button>
            <div [class]="m.separator" rdxMenuSeparator></div>

            <!-- Submenu: inner rdxMenuRoot provides submenu context -->
            <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
              <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                Find
                <span class="text-muted-foreground text-xs">›</span>
              </button>

              @if (findSub.open()) {
                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                  <div [class]="m.popup" rdxMenuPopup>
                    <button [class]="m.item" rdxMenuItem>Search Web…</button>
                    <button [class]="m.item" rdxMenuItem>Find…</button>
                    <button [class]="m.item" rdxMenuItem>Find and Replace…</button>
                    <button [class]="m.item" rdxMenuItem>Use Selection for Find</button>
                  </div>
                </div>
              }
            </ng-container>

            <!-- Second submenu -->
            <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
              <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                Spelling and Grammar
                <span class="text-muted-foreground text-xs">›</span>
              </button>

              @if (spellSub.open()) {
                <div [class]="m.positioner" side="right" align="start" sideOffset="4" rdxMenuPositioner>
                  <div [class]="m.popup" rdxMenuPopup>
                    <button [class]="m.item" rdxMenuItem>Show Spelling and Grammar</button>
                    <button [class]="m.item" rdxMenuItem>Check Document Now</button>
                    <div [class]="m.separator" rdxMenuSeparator></div>
                    <button [class]="m.item" rdxMenuItem>Check Spelling While Typing</button>
                    <button [class]="m.item" [disabled]="true" rdxMenuItem>Check Grammar</button>
                  </div>
                </div>
              }
            </ng-container>

            <div [class]="m.separator" rdxMenuSeparator></div>
            <button [class]="m.item" rdxMenuItem>Cut</button>
            <button [class]="m.item" rdxMenuItem>Copy</button>
            <button [class]="m.item" rdxMenuItem>Paste</button>
          </div>
        </div>
      }
    </ng-container>
  `
})
export class RdxMenuNestedComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly m = demoMenu;
}
```

### Arrow

Add `rdxMenuArrow` inside the popup to render a visual pointer connecting the popup to its trigger.
Fill color should match the popup surface — use `fill-popover` or set `fill` directly.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
  selector: 'rdx-menu-arrow',
  imports: [RdxMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #root="rdxMenuRoot" rdxMenuRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>With Arrow</button>

      @if (root.open()) {
        <div [class]="m.positioner" sideOffset="8" rdxMenuPositioner>
          <div [class]="cn(m.popup, 'relative')" rdxMenuPopup>
            <span [class]="m.arrow" rdxMenuArrow></span>
            <button [class]="m.item" rdxMenuItem>New Tab</button>
            <button [class]="m.item" rdxMenuItem>New Window</button>
            <div [class]="m.separator" rdxMenuSeparator></div>
            <button [class]="m.item" rdxMenuItem>Print…</button>
          </div>
        </div>
      }
    </ng-container>
  `
})
export class RdxMenuArrowExampleComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly m = demoMenu;
}
```

### Backdrop

Add `rdxMenuBackdrop` before the positioner (both inside `@if (root.open())`) to render an overlay
behind the popup. Set `[modal]="true"` on `rdxMenuRoot` to block outside pointer events.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
  selector: 'rdx-menu-backdrop',
  imports: [RdxMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #root="rdxMenuRoot" [modal]="true" rdxMenuRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>With Backdrop</button>

      @if (root.open()) {
        <div class="bg-foreground/10 fixed inset-0" rdxMenuBackdrop></div>
        <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
          <div [class]="m.popup" rdxMenuPopup>
            <button [class]="m.item" rdxMenuItem>New Tab</button>
            <button [class]="m.item" rdxMenuItem>New Window</button>
            <div [class]="m.separator" rdxMenuSeparator></div>
            <button [class]="m.item" [disabled]="true" rdxMenuItem>New Private Window</button>
            <div [class]="m.separator" rdxMenuSeparator></div>
            <button [class]="m.item" rdxMenuItem>Print…</button>
          </div>
        </div>
      }
    </ng-container>
  `
})
export class RdxMenuBackdropExampleComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly m = demoMenu;
}
```

### Viewport (animated resize)

Wrap the popup content in `rdxMenuViewport` to smoothly animate the popup size when the content
changes — for example revealing an advanced section, or switching between menubar menus of different
sizes. The viewport measures content and exposes `--popup-width` / `--popup-height`; bind them on
the popup with a CSS transition (here via Tailwind arbitrary utilities, so no story-local CSS):

```html
<div
  [class]="cn(m.popup, 'overflow-hidden [width:var(--popup-width)] [height:var(--popup-height)] transition-[width,height] duration-200')"
  rdxMenuPopup
>
  <div rdxMenuViewport>…items…</div>
</div>
```

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

/**
 * Demonstrates `rdxMenuViewport`: the popup smoothly resizes as its content
 * changes size. The viewport measures the content and exposes `--popup-width` /
 * `--popup-height`; the popup binds them with a CSS transition (expressed here
 * with Tailwind arbitrary utilities, so no story-local CSS is needed).
 */
@Component({
  selector: 'rdx-menu-viewport',
  imports: [RdxMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container #root="rdxMenuRoot" rdxMenuRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Settings</button>

      @if (root.open()) {
        <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
          <div
            [class]="
              cn(
                m.popup,
                '[height:var(--popup-height)] [width:var(--popup-width)] overflow-hidden transition-[width,height] duration-200 ease-out'
              )
            "
            rdxMenuPopup
          >
            <div rdxMenuViewport>
              <button [class]="m.item" [closeOnClick]="false" (onSelect)="toggle()" rdxMenuItem>
                {{ expanded() ? 'Hide advanced' : 'Show advanced' }}
              </button>
              <div [class]="m.separator" rdxMenuSeparator></div>
              <button [class]="m.item" rdxMenuItem>Profile</button>
              <button [class]="m.item" rdxMenuItem>Billing</button>

              @if (expanded()) {
                <div [class]="m.separator" rdxMenuSeparator></div>
                <button [class]="m.item" rdxMenuItem>Keyboard shortcuts</button>
                <button [class]="m.item" rdxMenuItem>Developer tools</button>
                <button [class]="m.item" rdxMenuItem>Feature flags</button>
                <button [class]="m.item" rdxMenuItem>API tokens</button>
              }
            </div>
          </div>
        </div>
      }
    </ng-container>
  `
})
export class RdxMenuViewportExampleComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly m = demoMenu;

  readonly expanded = signal(false);

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}
```

### CSS animations

`rdxMenuPopup` exposes `data-starting-style` on the enter frame and `data-ending-style` while the
exit animation plays. `(onOpenChangeComplete)` fires after the animation finishes. Use Angular
`styles` on the component (or global CSS) to define the keyframes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
  selector: 'rdx-menu-animated',
  imports: [RdxMenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      @keyframes popup-in {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-4px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes popup-out {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.95) translateY(-4px);
        }
      }
      .animated-popup {
        animation: popup-in 150ms ease;
      }
      .animated-popup[data-ending-style] {
        animation: popup-out 150ms ease;
      }
    `
  ],
  template: `
    <ng-container #root="rdxMenuRoot" rdxMenuRoot>
      <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>Animated</button>

      @if (root.open()) {
        <div [class]="m.positioner" sideOffset="4" rdxMenuPositioner>
          <div [class]="cn(m.popup, 'animated-popup')" rdxMenuPopup>
            <button [class]="m.item" rdxMenuItem>New Tab</button>
            <button [class]="m.item" rdxMenuItem>New Window</button>
            <div [class]="m.separator" rdxMenuSeparator></div>
            <button [class]="m.item" rdxMenuItem>Print…</button>
          </div>
        </div>
      }
    </ng-container>
  `
})
export class RdxMenuAnimatedComponent {
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly m = demoMenu;
}
```

#### Animation recipe

```css
@keyframes popup-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes popup-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
}

[rdxMenuPopup] {
  animation: popup-in 150ms ease;
  transform-origin: var(--transform-origin);
}
[rdxMenuPopup][data-ending-style] {
  animation: popup-out 150ms ease;
}
```

The optional backdrop uses the same attributes:

```css
[rdxMenuBackdrop] {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.3);
  animation: fade-in 150ms ease;
}
[rdxMenuBackdrop][data-ending-style] {
  animation: fade-out 150ms ease;
}
```

> **Note:** exit animations require the popup to remain mounted during the animation. With the
> `@if (root.open())` pattern the popup is removed immediately on close. To keep it mounted, render
> the positioner/popup unconditionally and toggle visibility via CSS `data-state` instead, or use
> a presence wrapper that waits for `animationend` before unmounting.

#### `onOpenChangeComplete`

Bind `(onOpenChangeComplete)` on `rdxMenuRoot` to run logic after the popup has fully appeared or
disappeared:

```html
<ng-container #root="rdxMenuRoot" (onOpenChangeComplete)="onDone($event)" rdxMenuRoot></ng-container>
```

The event carries `true` when the open animation finishes and `false` when the close animation
finishes.

## API Reference

### RdxMenuRoot

### RdxMenuTrigger

The button that opens the menu. Auto-detects a native `<button>` (set `nativeButton` to force it on
a custom element). Toggles the menu on click and supports keyboard opening (ArrowDown / ArrowUp open
and move focus to the first / last item).

Set `openOnHover` to open the menu while pointing at the trigger, with optional `delay` /
`closeDelay` (milliseconds) to debounce open and close. When the menu is part of a
[Menubar](?path=/docs/primitives-menubar--docs), the trigger reports `role="menuitem"`, joins the
roving tab order, and the menubar coordinates hover-switching between sibling menus.

### RdxMenuPositioner

Positions the popup against the trigger using the shared Floating UI Popper primitive. Exposes
`data-side`, `data-align`, and CSS custom properties for anchor and available-area dimensions:
`--anchor-width`, `--anchor-height`, `--available-width`, `--available-height`, `--transform-origin`.

### RdxMenuPopup

Owns keyboard navigation (ArrowDown / ArrowUp with optional `loopFocus` wrap, Home, End, typeahead,
Escape, ArrowLeft, Tab) and wires up Dismissable Layer and Focus Scope. Exposes
`data-starting-style` and `data-ending-style` for CSS transitions.

### RdxMenuViewport

An optional container placed inside `rdxMenuPopup` that wraps the menu content and smoothly
animates the popup size when the content changes (e.g. a section expands, or a menubar menu of a
different size opens). It measures content with a `ResizeObserver` and exposes the current size as
`--popup-width` / `--popup-height` on the host; drive the animation from CSS:

```css
[rdxMenuPopup] {
  width: var(--popup-width);
  height: var(--popup-height);
  transition:
    width 200ms,
    height 200ms;
}
```

`data-transitioning` is present while a size change is in flight. Has no inputs.

### RdxMenuItem

`closeOnClick` defaults to `true` — the menu closes when the item is activated.

### RdxMenuLinkItem

Renders on an `<a>` element. `closeOnClick` defaults to `false` so navigation can complete before
the menu unmounts.

### RdxMenuCheckboxItem

Toggles between `checked` / `unchecked` / `indeterminate`. `closeOnClick` defaults to `false`.

### RdxMenuRadioGroup

### RdxMenuRadioItem

`closeOnClick` defaults to `false` — the group stays open after selection.

### RdxMenuSubTrigger

An item that opens a nested submenu. Place it inside a `ng-container rdxMenuRoot` that also wraps
the submenu positioner and popup. The inner root provides the submenu context; the parent popup
discovers `rdxMenuSubTrigger` in its item selector and includes it in keyboard navigation
automatically.

### RdxMenuBackdrop

An optional overlay rendered behind the popup. Exposes `data-open`, `data-closed`, `data-state`,
`data-starting-style`, and `data-ending-style` for CSS animations. No inputs.

### RdxMenuArrow

An optional visual arrow rendered inside the popup and positioned by the shared Popper Arrow
primitive. Exposes `data-side`, `data-align`, and `data-uncentered` (set when the arrow cannot be
centered on the anchor). No inputs.

### RdxMenuGroup

Wraps a set of related items with `role="group"`. No inputs.

### RdxMenuGroupLabel

Marks a visible label for a group. No inputs.

### RdxMenuSeparator

Renders `role="separator"` with `aria-orientation="horizontal"`. No inputs.

### RdxMenuCheckboxItemIndicator

Visible only when the parent `rdxMenuCheckboxItem` is checked or indeterminate. Reads state from
the parent via context — no inputs.

### RdxMenuRadioItemIndicator

Visible only when the parent `rdxMenuRadioItem` is selected. Reads state from the parent via
context — no inputs.
