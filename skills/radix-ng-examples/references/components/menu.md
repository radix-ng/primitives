# Menu

#### A headless dropdown menu anchored to a trigger button.

Menu composes the shared Popper, Dismissable Layer, and Focus Scope primitives. It remains fully
headless — state is exposed through `data-*` attributes and the consumer provides all visual styles.

```typescript
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-default',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">File</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">New Tab</button>
                    <button rdxMenuItem [class]="m.item">New Window</button>
                    <button rdxMenuItem [class]="m.item" [disabled]="true">New Private Window</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <button rdxMenuItem [class]="m.item">Save Page As…</button>
                    <button rdxMenuItem [class]="m.item">Print…</button>
                </div>
            </div>
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
- ✅ `onOpenChange` reports the new `open` state together with `reason`, `trigger`, and source `event`.
- ✅ Positions the popup with the shared Floating UI-based Popper primitive.
- ✅ Optional visual arrow connecting the popup to its trigger (`rdxMenuArrow`).
- ✅ Optional backdrop overlay behind the popup (`rdxMenuBackdrop`).
- ✅ Closes on Escape (restoring focus to the trigger), outside pointer interaction, and Tab.
- ✅ Full keyboard navigation: ArrowDown, ArrowUp, Home, End, and character typeahead.
- ✅ Focus loop at list boundaries, configurable with `loopFocus`.
- ✅ Includes disabled items in keyboard navigation while preventing activation.
- ✅ `closeOnClick` per item — defaults to `true` for regular items, `false` for checkbox, radio, and link items.
- ✅ Checkbox items toggle state independently; radio groups enforce single selection.
- ✅ Grouped items with optional group labels and visual separators.
- ✅ Nested submenus via `rdxMenuSubTrigger` — opens on hover (100 ms delay) with safe-polygon traversal, click, or ArrowRight; closes on ArrowLeft.
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
    RdxMenuTrigger,
    RdxMenuViewport
} from '@radix-ng/primitives/menu';
```

Or import all parts through the module:

```typescript
import { RdxMenuModule } from '@radix-ng/primitives/menu';
```

## Anatomy

Apply the directives to your own markup. `rdxMenuPortal` is a **structural** directive: it teleports
the popup into `document.body` while the menu is open and keeps it mounted until the closed-state exit
keyframes finish. Use `*rdxMenuPortal` on the positioner for the common single-root case, or the
explicit `<ng-template rdxMenuPortal>` form (shown below) when an optional `rdxMenuBackdrop` makes the
content multi-root.

```html
<ng-container #root="rdxMenuRoot" rdxMenuRoot>
    <button rdxMenuTrigger>Open</button>

    <ng-template rdxMenuPortal>
        <!-- optional backdrop — a sibling root, before the positioner -->
        <div rdxMenuBackdrop></div>

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

                    <div *rdxMenuPortal side="right" align="start" sideOffset="4" rdxMenuPositioner>
                        <div rdxMenuPopup>
                            <button rdxMenuItem>Sub item A</button>
                            <button rdxMenuItem>Sub item B</button>
                        </div>
                    </div>
                </ng-container>
            </div>
        </div>
    </ng-template>
</ng-container>
```

## Examples

### Default

A basic dropdown with regular items, a disabled item, and a separator.

```typescript
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-default',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">File</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">New Tab</button>
                    <button rdxMenuItem [class]="m.item">New Window</button>
                    <button rdxMenuItem [class]="m.item" [disabled]="true">New Private Window</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <button rdxMenuItem [class]="m.item">Save Page As…</button>
                    <button rdxMenuItem [class]="m.item">Print…</button>
                </div>
            </div>
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
defaults to `false` for radio items). Bind `[(value)]` for controlled state or use `defaultValue` for
uncontrolled state. Values may be strings, numbers, objects, or other types and are compared by identity.
Set `disabled` on the group to disable all of its radio items. A nested `rdxMenuGroupLabel`
automatically labels the group through `aria-labelledby`.

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
The label automatically supplies the group's `aria-labelledby` relationship.
Disabled items remain in keyboard navigation, expose `data-disabled` / `aria-disabled`, and cannot be activated.

```html
<menu-with-labels-items-story />
```

### Nested submenus

Wrap a `rdxMenuSubTrigger` and its popup inside a nested `ng-container rdxMenuRoot`. The subtrigger
opens the submenu on hover (100 ms `delay`), click, or ArrowRight; ArrowLeft closes it and returns
focus to the subtrigger.

When opened by hover, the submenu keeps a **safe polygon** between the trigger and the popup: you can
move the pointer diagonally toward the submenu — even across a sibling subtrigger in between — without
it closing or switching. Moving the pointer away from that area closes the submenu (use `closeDelay`
to add a grace period).

![Submenu safe polygon — a triangular safe zone spans from the pointer to the popup, so the pointer can cut diagonally across the sibling row below without closing the submenu.](/menu-safe-polygon.svg)

```typescript
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-nested',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Edit</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="m.popup">
                    <button rdxMenuItem [class]="m.item">Undo</button>
                    <button rdxMenuItem [class]="m.item">Redo</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>

                    <!-- Submenu: inner rdxMenuRoot provides submenu context -->
                    <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                            Find
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>

                        <div
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                            [class]="m.positioner"
                        >
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item">Search Web…</button>
                                <button rdxMenuItem [class]="m.item">Find…</button>
                                <button rdxMenuItem [class]="m.item">Find and Replace…</button>
                                <button rdxMenuItem [class]="m.item">Use Selection for Find</button>
                            </div>
                        </div>
                    </ng-container>

                    <!-- Second submenu -->
                    <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                        <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                            Spelling and Grammar
                            <span class="text-muted-foreground text-xs">›</span>
                        </button>

                        <div
                            *rdxMenuPortal
                            side="right"
                            align="start"
                            sideOffset="4"
                            rdxMenuPositioner
                            [class]="m.positioner"
                        >
                            <div rdxMenuPopup [class]="m.popup">
                                <button rdxMenuItem [class]="m.item">Show Spelling and Grammar</button>
                                <button rdxMenuItem [class]="m.item">Check Document Now</button>
                                <div rdxMenuSeparator [class]="m.separator"></div>
                                <button rdxMenuItem [class]="m.item">Check Spelling While Typing</button>
                                <button rdxMenuItem [class]="m.item" [disabled]="true">Check Grammar</button>
                            </div>
                        </div>
                    </ng-container>

                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <button rdxMenuItem [class]="m.item">Cut</button>
                    <button rdxMenuItem [class]="m.item">Copy</button>
                    <button rdxMenuItem [class]="m.item">Paste</button>
                </div>
            </div>
        </ng-container>
    `
})
export class RdxMenuNestedComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```

```typescript
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

/**
 * RTL nested menu: submenus open to the *left* (`side="left"`), so the safe-polygon geometry must
 * resolve the placed side correctly. Mirrors the LTR nested demo with the direction reversed.
 */
@Component({
    selector: 'rdx-menu-nested-rtl',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div dir="rtl">
            <ng-container #root="rdxMenuRoot" dir="rtl" rdxMenuRoot>
                <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">تحرير</button>

                <div *rdxMenuPortal side="bottom" align="end" sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">تراجع</button>
                        <button rdxMenuItem [class]="m.item">إعادة</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>

                        <!-- Submenu opens to the left in RTL -->
                        <ng-container #findSub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                                <span class="text-muted-foreground text-xs">‹</span>
                                بحث
                            </button>

                            <div
                                *rdxMenuPortal
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                                [class]="m.positioner"
                            >
                                <div rdxMenuPopup [class]="m.popup">
                                    <button rdxMenuItem [class]="m.item">بحث في الويب…</button>
                                    <button rdxMenuItem [class]="m.item">بحث…</button>
                                    <button rdxMenuItem [class]="m.item">بحث واستبدال…</button>
                                    <button rdxMenuItem [class]="m.item">استخدام التحديد للبحث</button>
                                </div>
                            </div>
                        </ng-container>

                        <ng-container #spellSub="rdxMenuRoot" rdxMenuRoot>
                            <button rdxMenuSubTrigger [class]="cn(m.item, 'justify-between')">
                                <span class="text-muted-foreground text-xs">‹</span>
                                التدقيق الإملائي والنحوي
                            </button>

                            <div
                                *rdxMenuPortal
                                side="left"
                                align="start"
                                sideOffset="4"
                                rdxMenuPositioner
                                [class]="m.positioner"
                            >
                                <div rdxMenuPopup [class]="m.popup">
                                    <button rdxMenuItem [class]="m.item">عرض التدقيق الإملائي والنحوي</button>
                                    <button rdxMenuItem [class]="m.item">تدقيق المستند الآن</button>
                                    <div rdxMenuSeparator [class]="m.separator"></div>
                                    <button rdxMenuItem [class]="m.item">التدقيق الإملائي أثناء الكتابة</button>
                                    <button rdxMenuItem [class]="m.item" [disabled]="true">التدقيق النحوي</button>
                                </div>
                            </div>
                        </ng-container>

                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">قص</button>
                        <button rdxMenuItem [class]="m.item">نسخ</button>
                        <button rdxMenuItem [class]="m.item">لصق</button>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class RdxMenuNestedRtlComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
```

### Arrow

Add `rdxMenuArrow` inside the popup to render a visual pointer connecting the popup to its trigger.
The arrow SVG fills with `currentColor`, so match the popup surface with a `text-*` token (e.g.
`text-popover`) rather than a `fill-*` class. A directional `drop-shadow` in the border color lets
the popup border flow into the arrow as one continuous outline.

```typescript
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-arrow',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">With Arrow</button>

            <div *rdxMenuPortal sideOffset="8" rdxMenuPositioner [class]="m.positioner">
                <div rdxMenuPopup [class]="cn(m.popup, 'relative')">
                    <span rdxMenuArrow [class]="m.arrow"></span>
                    <button rdxMenuItem [class]="m.item">New Tab</button>
                    <button rdxMenuItem [class]="m.item">New Window</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <button rdxMenuItem [class]="m.item">Print…</button>
                </div>
            </div>
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

Add `rdxMenuBackdrop` as a sibling root before the positioner inside an explicit
`<ng-template rdxMenuPortal>` to render an overlay behind the popup. Menus are modal by default,
blocking outside pointer events and page scrolling; set `[modal]="false"` to opt out.

```typescript
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-backdrop',
    imports: [RdxMenuModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot [modal]="true">
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">With Backdrop</button>

            <ng-template rdxMenuPortal>
                <div class="bg-foreground/10 fixed inset-0" rdxMenuBackdrop></div>
                <div sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                    <div rdxMenuPopup [class]="m.popup">
                        <button rdxMenuItem [class]="m.item">New Tab</button>
                        <button rdxMenuItem [class]="m.item">New Window</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item" [disabled]="true">New Private Window</button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Print…</button>
                    </div>
                </div>
            </ng-template>
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
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

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
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Settings</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="m.positioner">
                <div
                    rdxMenuPopup
                    [class]="
                        cn(
                            m.popup,
                            '[height:var(--popup-height)] [width:var(--popup-width)] overflow-hidden transition-[width,height] duration-200 ease-out'
                        )
                    "
                >
                    <div rdxMenuViewport>
                        <button rdxMenuItem [class]="m.item" [closeOnClick]="false" (onSelect)="toggle()">
                            {{ expanded() ? 'Hide advanced' : 'Show advanced' }}
                        </button>
                        <div rdxMenuSeparator [class]="m.separator"></div>
                        <button rdxMenuItem [class]="m.item">Profile</button>
                        <button rdxMenuItem [class]="m.item">Billing</button>

                        @if (expanded()) {
                            <div rdxMenuSeparator [class]="m.separator"></div>
                            <button rdxMenuItem [class]="m.item">Keyboard shortcuts</button>
                            <button rdxMenuItem [class]="m.item">Developer tools</button>
                            <button rdxMenuItem [class]="m.item">Feature flags</button>
                            <button rdxMenuItem [class]="m.item">API tokens</button>
                        }
                    </div>
                </div>
            </div>
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

The structural `*rdxMenuPortal` keeps the popup mounted until the closed-state exit keyframes on its
root element (the positioner) finish, so the menu now has real exit animations. `rdxMenuPopup` also
exposes `data-starting-style` on the enter frame and `data-ending-style` while the exit plays, and
`(onOpenChangeComplete)` fires after the animation finishes. Put an opacity exit keyframe on the
positioner (the part presence watches, keyed on `data-open` / `data-closed`) and keep the transform
zoom on the popup. Use Angular `styles` on the component (or global CSS) to define the keyframes.

```typescript
import { cn, demoButton, demoMenu } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxMenuModule } from '@radix-ng/primitives/menu';

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
            /*
             * Unlike popover/navigation-menu, the shared menu popup carries 'data-[closed]:hidden' (it
             * is reused by the always-rendered menubar popups), so on close it is 'display: none' and
             * cannot run its own exit animation. The exit therefore lives on the positioner — keyed on
             * its 'data-open'/'data-closed' — which is what the presence machine waits on before
             * unmounting. This is a legitimate carrier, not an ADR-0011 "decoy".
             */
            @keyframes positioner-fade-in {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            @keyframes positioner-fade-out {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            .animated-positioner[data-open] {
                animation: positioner-fade-in 150ms ease;
            }
            .animated-positioner[data-closed] {
                animation: positioner-fade-out 150ms ease;
            }
        `
    ],
    template: `
        <ng-container #root="rdxMenuRoot" rdxMenuRoot>
            <button rdxMenuTrigger [class]="cn(b.base, b.outline, b.size.md)">Animated</button>

            <div *rdxMenuPortal sideOffset="4" rdxMenuPositioner [class]="cn(m.positioner, 'animated-positioner')">
                <div rdxMenuPopup [class]="cn(m.popup, 'animated-popup')">
                    <button rdxMenuItem [class]="m.item">New Tab</button>
                    <button rdxMenuItem [class]="m.item">New Window</button>
                    <div rdxMenuSeparator [class]="m.separator"></div>
                    <button rdxMenuItem [class]="m.item">Print…</button>
                </div>
            </div>
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
    from { opacity: 0; transform: scale(0.95) translateY(-4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
@keyframes popup-out {
    from { opacity: 1; transform: scale(1)    translateY(0);    }
    to   { opacity: 0; transform: scale(0.95) translateY(-4px); }
}

/* The positioner is the part `*rdxMenuPortal` watches: its closed-state keyframe is what keeps the
   popup mounted until the exit finishes. Opacity-only, so it never fights the popper's transform. */
@keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
}
@keyframes fade-out {
    from { opacity: 1; }
    to   { opacity: 0; }
}
[rdxMenuPositioner][data-open]   { animation: fade-in 150ms ease; }
[rdxMenuPositioner][data-closed] { animation: fade-out 150ms ease; }

/* The popup carries the transform zoom (it is not popper-positioned). */
[rdxMenuPopup] {
    animation: popup-in 150ms ease;
    transform-origin: var(--transform-origin);
}
[rdxMenuPopup][data-ending-style] {
    animation: popup-out 150ms ease;
}
```

The optional backdrop is a sibling root; it carries `data-open` / `data-closed` too:

```css
[rdxMenuBackdrop] {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.3);
}
[rdxMenuBackdrop][data-open]   { animation: fade-in 150ms ease; }
[rdxMenuBackdrop][data-closed] { animation: fade-out 150ms ease; }
```

#### `onOpenChangeComplete`

Bind `(onOpenChangeComplete)` on `rdxMenuRoot` to run logic after the popup has fully appeared or
disappeared:

```html
<ng-container #root="rdxMenuRoot" (onOpenChangeComplete)="onDone($event)" rdxMenuRoot>
```

The event carries `true` when the open animation finishes and `false` when the close animation
finishes.

## API Reference

### RdxMenuRoot

`RdxMenuRoot` owns the shared open state. Use `[(open)]` for plain state syncing, or bind
`(onOpenChange)` when you need the full change details object.

### RdxMenuTrigger

The button that opens the menu. Auto-detects a native `<button>` (set `nativeButton` to force it on
a custom element). Toggles the menu on click and supports keyboard opening (ArrowDown / ArrowUp open
and move focus to the first / last item).

Set `openOnHover` to open the menu while pointing at the trigger, with optional `delay` /
`closeDelay` (milliseconds) to debounce open and close. `delay` defaults to 100 ms and `closeDelay`
defaults to 0. A safe polygon keeps a hover-opened menu open while the pointer travels from the trigger
to the popup. When the menu is part of a
[Menubar](?path=/docs/primitives-menubar--docs), the trigger reports `role="menuitem"`, joins the
menubar Composite focus order, and the menubar coordinates hover-switching between sibling menus.

**Data attributes**

| Attribute         | Present when                       |
| ----------------- | ---------------------------------- |
| `data-popup-open` | The menu is open.                  |
| `data-pressed`    | The trigger is pressed.            |
| `data-disabled`   | The trigger is disabled.           |

### RdxMenuPositioner

Positions the popup against the trigger using the shared Floating UI Popper primitive. Exposes
`data-side`, `data-align`, and CSS custom properties for anchor and available-area dimensions:
`--anchor-width`, `--anchor-height`, `--available-width`, `--available-height`, `--transform-origin`.

### RdxMenuPopup

Owns keyboard navigation (ArrowDown / ArrowUp with optional `loopFocus` wrap, Home, End, typeahead,
Escape, ArrowLeft, Tab) and wires up Dismissable Layer and Focus Scope.

**Data attributes**

| Attribute             | Present when / value                                                       |
| --------------------- | ------------------------------------------------------------------------- |
| `data-open`           | The menu is open.                                                          |
| `data-closed`         | The menu is closed.                                                        |
| `data-side`           | Resolved side — `top` / `right` / `bottom` / `left`.                       |
| `data-align`          | Resolved alignment — `start` / `center` / `end`.                           |
| `data-starting-style` | The enter transition is about to run.                                      |
| `data-ending-style`   | The exit transition is running.                                            |
| `data-instant`        | An open/close happened with no transition — `click` / `dismiss` / `group` / `trigger-change`. |

### RdxMenuViewport

An optional container placed inside `rdxMenuPopup` that wraps the menu content and smoothly
animates the popup size when the content changes (e.g. a section expands, or a menubar menu of a
different size opens). It measures content with a `ResizeObserver` and exposes the current size as
`--popup-width` / `--popup-height` on the host; drive the animation from CSS:

```css
[rdxMenuPopup] {
    width: var(--popup-width);
    height: var(--popup-height);
    transition: width 200ms, height 200ms;
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
`onCheckedChange` emits `{ checked, eventDetails }` and is cancelable via `eventDetails.cancel()`.

**Data attributes**

| Attribute            | Present when                       |
| -------------------- | ---------------------------------- |
| `data-checked`       | The item is checked.               |
| `data-unchecked`     | The item is unchecked.             |
| `data-indeterminate` | The item is indeterminate.         |
| `data-highlighted`   | The item is highlighted.           |
| `data-disabled`      | The item is disabled.              |

### RdxMenuRadioGroup

`onValueChange` emits `{ value, eventDetails }` and is cancelable via `eventDetails.cancel()`.

### RdxMenuRadioItem

`closeOnClick` defaults to `false` — the group stays open after selection.

**Data attributes**

| Attribute          | Present when               |
| ------------------ | -------------------------- |
| `data-checked`     | The item is selected.      |
| `data-unchecked`   | The item is not selected.  |
| `data-highlighted` | The item is highlighted.   |
| `data-disabled`    | The item is disabled.      |

### RdxMenuSubTrigger

An item that opens a nested submenu. Place it inside a `ng-container rdxMenuRoot` that also wraps
the submenu positioner and popup. The inner root provides the submenu context; the parent popup
discovers `rdxMenuSubTrigger` in its item selector and includes it in keyboard navigation
automatically.

### RdxMenuBackdrop

An optional overlay rendered behind the popup. Exposes `data-open`, `data-closed`,
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

## Accessibility

### Keyboard Interactions

| Key | Description |
| --- | --- |
| `Enter` / `Space` | On the trigger: toggles the menu open/closed. Native button triggers use the browser keyboard click; non-native triggers handle the keys directly. On a focused item or sub-trigger: activates the item. |
| `ArrowDown` | On the trigger: opens the menu and moves focus to the first item. Inside the popup: moves focus to the next item, wrapping to the first when `loopFocus` is enabled. |
| `ArrowUp` | On the trigger: opens the menu and moves focus to the last item. Inside the popup: moves focus to the previous item, wrapping to the last when `loopFocus` is enabled. |
| `ArrowRight` | On a sub-trigger: opens the submenu and moves focus into it. Inside the popup (menubar context): delegates to the menubar for sibling menu navigation. |
| `ArrowLeft` | Inside a submenu popup: closes the submenu and returns focus to the sub-trigger. In a menubar context: delegates to the menubar for sibling menu navigation. |
| `Home` | Inside the popup: moves focus to the first item. |
| `End` | Inside the popup: moves focus to the last item. |
| `Escape` | Inside the popup: closes the menu (and optionally its parent when `closeParentOnEsc` is set) and returns focus to the trigger. |
| `Tab` | Inside the popup: closes the menu and allows natural tab navigation to continue. |
| Character keys | Inside the popup: typeahead — jumps focus to the first item whose label starts with the typed character(s). |
