# Presence

`RdxPresenceDirective` conditionally creates an Angular template and keeps its live view through
finite exit animations. Reopening during exit preserves the same DOM, components and local state.

Compose it into an `ng-template` directive using `hostDirectives`, and provide a reactive `present`
signal through `provideRdxPresenceContext`.

### Conditional content

The template roots participate automatically. CSS transitions and keyframes both work.

```typescript
import { ChangeDetectionStrategy, Component, Directive, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceDirective } from '@radix-ng/primitives/presence';

/**
 * Demo wrapper that mirrors how real consumers apply the presence directive:
 * a selectored `ng-template` directive that composes `RdxPresenceDirective` via
 * `hostDirectives` and feeds it a `present` signal through the presence context.
 */
@Directive({
    selector: 'ng-template[presenceDemo]',
    hostDirectives: [RdxPresenceDirective]
})
export class PresenceDemo {}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-example',
    imports: [PresenceDemo],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceExample).open }))],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                (click)="open.set(!open())"
                type="button"
            >
                {{ open() ? 'Unmount' : 'Mount' }}
            </button>

            <div class="flex h-28 items-center">
                <ng-template presenceDemo>
                    <div
                        class="presence-box border-border bg-card text-card-foreground flex h-24 w-48 items-center justify-center rounded-md border text-sm shadow-sm transition-[opacity,transform] duration-200 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 starting:scale-95 starting:opacity-0"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        I'm present
                    </div>
                </ng-template>
            </div>

            <p class="text-muted-foreground text-sm">present: {{ open() }}</p>
        </div>
    `
})
export class PresenceExample {
    readonly open = signal(false);
}
```

## Usage

```ts
@Directive({
    selector: 'ng-template[myContentPresence]',
    hostDirectives: [RdxPresenceDirective],
    providers: [
        provideRdxPresenceContext(() => ({ present: injectMyRootContext().open }))
    ]
})
export class MyContentPresence {}
```

```html
<ng-template myContentPresence>
    <div class="transition-opacity duration-200 data-[closed]:opacity-0"
         [attr.data-closed]="open() ? undefined : ''">Content</div>
</ng-template>
```

### Animated descendants

Import `RdxPresenceTarget` and apply `rdxPresenceTarget` to an animated descendant. Its finite
animations then participate in the same view lifetime. Unregistered descendants do not delay
removal. Infinite animations are ignored, including on registered targets. If a transition is
canceled and replaced, Presence waits for the replacement.
Changing an animation's duration or playback rate keeps the view until that animation finishes.
Paused finite animations retain the view until their owner finishes or cancels them.

```html
<ng-template myContentPresence>
    <section>
        <div rdxPresenceTarget class="transition-opacity duration-200 data-[closed]:opacity-0"
             [attr.data-closed]="open() ? undefined : ''">Animated content</div>
    </section>
</ng-template>
```

Popup, Backdrop and Tabs Panel parts register their own animation elements. Structural portals
consume their owner's lifetime; styling a Popup requires no additional Presence directive.
For an additional animated element, place `rdxPresenceTarget` inside the structural template.

### Explicit descendant animation

Only the marked descendant runs exit keyframes; the containing view stays mounted until it finishes.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceTarget } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/** A nested animation participates only through an explicit rdxPresenceTarget. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-waapi-subtree',
    imports: [PresenceDemo, RdxPresenceTarget],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiSubtree).open }))],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                (click)="open.set(!open())"
                type="button"
            >
                {{ open() ? 'Unmount' : 'Mount' }}
            </button>

            <div class="flex h-28 items-center">
                <ng-template presenceDemo>
                    <div
                        class="waapi-root group border-border bg-card flex h-24 w-48 items-center justify-center rounded-md border p-2 shadow-sm"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        <div
                            class="waapi-child text-card-foreground text-sm group-data-[state=closed]:animate-ping group-data-[state=closed]:[animation-duration:var(--duration-demo-presence-animation)] group-data-[state=closed]:[animation-iteration-count:1]"
                            rdxPresenceTarget
                        >
                            explicit descendant exit
                        </div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceWaapiSubtree {
    readonly open = signal(false);
}
```

### Infinite animation

The marked spinner runs continuously. Infinite motion does not delay removal when the view closes.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceTarget } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

/** An explicitly registered infinite spinner never holds a finite render lifetime open. */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'presence-waapi-spinner',
    imports: [PresenceDemo, RdxPresenceTarget],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceWaapiSpinner).open }))],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm outline-none focus-visible:ring-2"
                (click)="open.set(!open())"
                type="button"
            >
                {{ open() ? 'Unmount' : 'Mount' }}
            </button>

            <div class="flex h-28 items-center">
                <ng-template presenceDemo>
                    <div
                        class="waapi-root border-border bg-card flex h-24 w-48 items-center justify-center rounded-md border shadow-sm"
                        [attr.data-state]="open() ? 'open' : 'closed'"
                    >
                        <div
                            class="waapi-spinner border-muted-foreground size-6 animate-spin rounded-full border-2 border-t-transparent"
                            rdxPresenceTarget
                        ></div>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceWaapiSpinner {
    readonly open = signal(false);
}
```

### Dynamic animation targets

Targets created during exit join the current wait. Removing a target releases its animations from
the lifetime, including paused animations; it does not cancel the animations themselves.

```typescript
import { Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceTarget } from '@radix-ng/primitives/presence';
import { PresenceDemo } from './presence';

@Component({
    selector: 'presence-dynamic-targets',
    imports: [PresenceDemo, RdxPresenceTarget],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceDynamicTargets).open }))],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button class="demo-button demo-button-outline h-9 px-4" (click)="open.set(!open())" type="button">
                {{ open() ? 'Unmount' : 'Mount' }}
            </button>
            <button
                class="demo-button demo-button-outline h-9 px-4"
                (click)="showChild.set(!showChild())"
                type="button"
            >
                {{ showChild() ? 'Remove animated child' : 'Add animated child' }}
            </button>
            <div class="flex h-28 items-center">
                <ng-template presenceDemo>
                    <div
                        class="dynamic-presence-root group border-border bg-card text-card-foreground flex h-24 w-56 items-center justify-center rounded-md border p-2 text-sm shadow-sm transition-opacity duration-1000 data-[closed]:opacity-0"
                        [attr.data-closed]="open() ? undefined : ''"
                    >
                        @if (showChild()) {
                            <span
                                class="dynamic-presence-child group-data-[closed]:animate-ping group-data-[closed]:[animation-duration:var(--duration-demo-presence-dynamic)] group-data-[closed]:[animation-iteration-count:1]"
                                rdxPresenceTarget
                            >
                                Dynamic animation target
                            </span>
                        }
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceDynamicTargets {
    readonly open = signal(false);
    readonly showChild = signal(true);
}
```

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives`. Copy the component from **Show code** and any shared files below,
preserving their relative import paths. Import the example component in its parent and use its selector.

Install `tailwindcss`, `@tailwindcss/postcss` and `postcss`. Configure the PostCSS plugin:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Save the CSS below as `demo-styles.css` next to your global stylesheet. Import Tailwind first,
then the demo styles. Both Storybook and Playground use this same CSS through `main.css`.

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

The shared file supplies theme values, light/dark tokens, common classes and animation keyframes.
Set `data-theme="dark"` on `<html>` for the dark theme; the default is light. The font stacks have
system fallbacks; Inter and JetBrains Mono can be self-hosted for the Storybook typography.

<details>
<summary>demo-styles.css</summary>

[Download demo-styles.css](../demo-styles.css)

</details>

## API Reference

### `RdxPresenceDirective`

Compose on an `ng-template` through `hostDirectives`. It adds no wrapper and exposes no styling attributes.
Inert Angular-managed template siblings delimit the live view, including dehydrated `@defer` roots
and roots created later by `@if` / `@for`. Preserve these boundaries when processing server HTML.
Standalone roots remain animation participants when they own an attribute `rdxPortal`.
Scope styling to part attributes/classes: the inert templates count as element siblings for
positional selectors such as `:first-child`.

### `RdxPresenceTarget`

Apply `rdxPresenceTarget` to the element whose animations should retain the containing Presence
view. It has no inputs, outputs or styling attributes.

### `RdxPresenceContext`

- `present: Signal<boolean>` supplies logical presence.
- `renderLifecycle?: RdxRenderLifecycle` shares an existing semantic owner's lifetime.
- `skipExitAnimation?: Signal<boolean>` ends a standalone utility's exit immediately.
- `registerPresence?` reports the physical view to a popup's completion coordinator.

### `provideRdxPresenceContext(factory)`

Registers the context consumed by structural Presence. The factory runs in an injection context.

## Migration

`PresenceMachine` and `PresenceMachineHost` have been removed. Core's `useRenderLifecycle` owns
render state and shares `waitForAnimations` with other animated parts. `useTransitionStatus` and
`RdxTransitionStatusRef` are replaced by `useRenderLifecycle` and `RdxRenderLifecycle`.

Automatic subtree discovery has been removed. Add `rdxPresenceTarget` to animated descendants
that are not already registered primitive parts. `animate.leave` remains appropriate when an
application template owns removal; Presence retains the Angular view itself until exit completes.
