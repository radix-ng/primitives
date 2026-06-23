# Button

#### A button, or any element that should behave like one.

Headless button behavior modeled on [Base UI](https://base-ui.com/)'s `useButton`. It carries no
styles — visual variants in the examples come from the centralized demo style layer (see the
**Guides/Styling** page).

```typescript
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Visual variants — the recommended `demoButton` styling from the centralized
 * style layer applied on top of the headless `rdxButton` directive.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-variants',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button rdxButton [class]="cn(b.base, b.primary, b.size.md)">Primary</button>
            <button rdxButton [class]="cn(b.base, b.secondary, b.size.md)">Secondary</button>
            <button rdxButton [class]="cn(b.base, b.outline, b.size.md)">Outline</button>
            <button rdxButton [class]="cn(b.base, b.ghost, b.size.md)">Ghost</button>
            <button rdxButton [class]="cn(b.base, b.destructive, b.size.md)">Destructive</button>
        </div>
    `
})
export class RdxButtonVariantsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
```

## Features

- ✅ Works on a native `<button>` or any other element (`<a>`, `<span>`, …).
- ✅ Exposes state via the `data-disabled` attribute for styling.
- ✅ `focusableWhenDisabled` keeps the control in the tab order (uses `aria-disabled`).
- ✅ Adds `role="button"`, `tabindex`, and Enter/Space activation on non-button hosts.

## Import

```typescript
import { RdxButtonDirective } from '@radix-ng/primitives/button';
```

## Anatomy

Button is a single directive — apply `rdxButton` to a native `<button>` or to any element you want
to behave like a button.

```html
<button rdxButton>...</button>

<!-- or on any other host -->
<a rdxButton href="...">...</a>
```

## Examples

### Variants

Visual variants — `primary`, `secondary`, `outline`, `ghost`, and `destructive` — come from the
shared `demoButton` style layer, not the directive itself.

```typescript
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Visual variants — the recommended `demoButton` styling from the centralized
 * style layer applied on top of the headless `rdxButton` directive.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-variants',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button rdxButton [class]="cn(b.base, b.primary, b.size.md)">Primary</button>
            <button rdxButton [class]="cn(b.base, b.secondary, b.size.md)">Secondary</button>
            <button rdxButton [class]="cn(b.base, b.outline, b.size.md)">Outline</button>
            <button rdxButton [class]="cn(b.base, b.ghost, b.size.md)">Ghost</button>
            <button rdxButton [class]="cn(b.base, b.destructive, b.size.md)">Destructive</button>
        </div>
    `
})
export class RdxButtonVariantsComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
```

### Sizes

`sm`, `md`, `lg`, and a square `icon` size.

```typescript
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';

/**
 * Sizes, including a square icon button.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-sizes',
    imports: [RdxButtonDirective, LucideDynamicIcon, LucidePlus],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button rdxButton [class]="cn(b.base, b.primary, b.size.sm)">Small</button>
            <button rdxButton [class]="cn(b.base, b.primary, b.size.md)">Medium</button>
            <button rdxButton [class]="cn(b.base, b.primary, b.size.lg)">Large</button>
            <button rdxButton aria-label="Add" [class]="cn(b.base, b.primary, b.size.icon)">
                <svg class="flex" lucidePlus size="16" />
            </button>
        </div>
    `
})
export class RdxButtonSizesComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
```

### Disabled

The first button uses the native `disabled` attribute (removed from the tab order). The second sets
`focusableWhenDisabled`, so it stays focusable via `aria-disabled` while its activation is suppressed.

```typescript
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Disabled handling. The first button uses the native `disabled` attribute
 * (removed from the tab order). The second sets `focusableWhenDisabled`, so it
 * stays focusable via `aria-disabled` while its activation is suppressed.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-disabled',
    imports: [RdxButtonDirective],
    template: `
        <div class="flex flex-wrap items-center gap-3">
            <button rdxButton disabled [class]="cn(b.base, b.primary, b.size.md)">Disabled</button>
            <button rdxButton disabled focusableWhenDisabled [class]="cn(b.base, b.outline, b.size.md)">
                Disabled (focusable)
            </button>
        </div>
    `
})
export class RdxButtonDisabledComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
```

### As link

The directive applies button semantics to any element. Here an `<a>` renders as a button while
keeping native link behavior.

```typescript
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The directive works on any host. Here it renders an `<a>` as a button while
 * keeping native link behavior.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-as-link',
    imports: [RdxButtonDirective],
    template: `
        <a rdxButton href="https://base-ui.com" target="_blank" [class]="cn(b.base, b.secondary, b.size.md)">
            Open Base UI
        </a>
    `
})
export class RdxButtonAsLinkComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
}
```

### Loading

For buttons that enter a loading state after being clicked, set `disabled` while pending together
with `focusableWhenDisabled` so focus stays on the button. Add `aria-busy` and render a spinner to
communicate the state.

```typescript
import { cn, demoButton } from '../../storybook/styles';
import { RdxButtonDirective } from '../src/button.directive';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideDynamicIcon, LucidePlus } from '@lucide/angular';

/**
 * Loading state. Following Base UI's guidance, the button becomes `disabled`
 * while loading but uses `focusableWhenDisabled` so focus stays on it. `aria-busy`
 * announces the pending state, and a spinner is rendered in place of the icon.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-button-loading',
    imports: [RdxButtonDirective, LucideDynamicIcon, LucidePlus],
    template: `
        <button
            rdxButton
            focusableWhenDisabled
            [disabled]="loading()"
            [attr.aria-busy]="loading() ? 'true' : null"
            [class]="cn(b.base, b.primary, b.size.md)"
            (click)="run()"
        >
            <svg
                class="flex"
                size="16"
                [lucideIcon]="loading() ? 'loader-circle' : 'save'"
                [class.animate-spin]="loading()"
            />
            {{ loading() ? 'Saving…' : 'Save' }}
        </button>
    `
})
export class RdxButtonLoadingComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly loading = signal(false);

    protected run(): void {
        if (this.loading()) {
            return;
        }
        this.loading.set(true);
        setTimeout(() => this.loading.set(false), 2000);
    }
}
```

```html
<button rdxButton>Button</button>

<!-- disabled but still focusable -->
<button rdxButton disabled focusableWhenDisabled>Disabled</button>

<!-- render a link as a button -->
<a rdxButton href="/docs">Docs</a>
```

## API Reference

`RdxButtonDirective` — headless button behavior. Apply to a native `<button>` element, or to any other element (e.g. `<a>`, `<span>`) to give it button semantics (`role="button"`, keyboard activation, focus management) — the host tag is detected automatically, so there is no `nativeButton` prop.

**Data attributes**

| Attribute       | Present when             |
| --------------- | ------------------------ |
| `data-disabled` | The button is disabled.  |
