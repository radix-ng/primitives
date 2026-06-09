# Toast

#### A succinct, low-priority message that appears temporarily, stacks, and can be swiped away.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

@Component({
  selector: 'toast-default-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <button [class]="cn(b.base, b.primary, b.size.md)" (click)="notify()">Show toast</button>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                @if (toast.description) {
                  <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
                }
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastDefaultExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  private count = 0;

  notify(): void {
    this.count++;
    this.manager.add({
      title: `Notification ${this.count}`,
      description: 'Your changes have been saved.'
    });
  }
}
```

## Features

- ✅ Imperative API — push toasts from anywhere with `add` / `update` / `close` / `promise`.
- ✅ Headless and unstyled — state is exposed through `data-*` attributes and CSS variables.
- ✅ Stacking with a hover/focus expand, driven by measured heights (`--toast-offset-y`).
- ✅ Swipe-to-dismiss with rubber-banding and flick detection in any allowed direction.
- ✅ Auto-dismiss timers that pause while the stack is hovered, focused, or being swiped.
- ✅ Promise toasts with `loading` / `success` / `error` copy.
- ✅ Accessible — announces through `role="status"` / `role="alert"` by priority.

## Import

```ts
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
```

`toastImports` bundles every part directive; `provideRdxToastManager()` (or the `[rdxToastProvider]`
directive) supplies the queue, and `RdxToastManager` is injected to push toasts.

## Anatomy

Provide the manager once, render the viewport, and iterate the queue. Each item from
`manager.toasts()` is bound to a `rdxToastRoot`.

```html
<div rdxToastProvider>
  <div rdxToastPortal>
    <div rdxToastViewport>
      <!-- @for (toast of manager.toasts(); track toast.id) -->
      <div rdxToastRoot [toast]="toast">
        <div rdxToastContent>
          <p rdxToastTitle></p>
          <p rdxToastDescription></p>
          <button rdxToastAction></button>
          <button rdxToastClose></button>
        </div>
      </div>
    </div>
  </div>
</div>
```

```ts
const manager = inject(RdxToastManager);
manager.add({ title: 'Saved', description: 'Your changes are live.' });
```

An anchored toast is wrapped in `rdxToastPositioner` instead of joining the stack:

```html
<div rdxToastPositioner [anchor]="toast.positionerProps.anchor">
  <div rdxToastRoot [toast]="toast">
    <div rdxToastContent>
      <p rdxToastTitle></p>
    </div>
  </div>
</div>
```

## Examples

### Default

Push a single toast; it auto-dismisses after the timeout.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

@Component({
  selector: 'toast-default-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <button [class]="cn(b.base, b.primary, b.size.md)" (click)="notify()">Show toast</button>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                @if (toast.description) {
                  <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
                }
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastDefaultExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  private count = 0;

  notify(): void {
    this.count++;
    this.manager.add({
      title: `Notification ${this.count}`,
      description: 'Your changes have been saved.'
    });
  }
}
```

### Stacking

Add several toasts to see the collapsed stack, then hover or focus it to expand. Auto-dismiss pauses
while the stack is hovered or focused.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * Push several toasts to see the collapsed stack, then hover (or focus) the stack to expand it —
 * `data-expanded` lays each toast out by its measured `--toast-offset-y`. Auto-dismiss pauses
 * while the stack is hovered or focused.
 */
@Component({
  selector: 'toast-stacking-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <div class="flex gap-2">
      <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Add toast</button>
      <button [class]="cn(b.base, b.outline, b.size.md)" (click)="manager.close()">Clear all</button>
    </div>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastStackingExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  private count = 0;

  add(): void {
    this.count++;
    this.manager.add({
      title: `Message ${this.count}`,
      description: 'Hover the stack to expand it.',
      timeout: 0
    });
  }
}
```

### Swipe to dismiss

Drag a toast toward an allowed `swipeDirection` to dismiss it; release early to snap back.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * Toasts can be dismissed by swiping. `swipeDirection` lists the allowed directions; the gesture
 * follows whichever the pointer drags toward most and dismisses past a threshold (or on a flick).
 * The live offset is exposed as `--toast-swipe-movement-x/y` and applied to the content.
 */
@Component({
  selector: 'toast-swipe-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Show swipeable toast</button>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" [swipeDirection]="['right', 'down']" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>Swipe me away</p>
                <p [class]="t.description" rdxToastDescription>
                  Drag right or down to dismiss. Release early to snap back.
                </p>
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastSwipeExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  add(): void {
    this.manager.add({ title: 'Swipe me away', timeout: 0 });
  }
}
```

### Promise

Drive one toast through a promise: `loading`, then `success` or `error`.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * `manager.promise()` drives a single toast through a promise's lifecycle: it shows the `loading`
 * copy, then swaps to `success` or `error` when the promise settles. The loading toast skips
 * auto-dismiss; the resolved one picks the timeout back up.
 */
@Component({
  selector: 'toast-promise-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <div class="flex gap-2">
      <button [class]="cn(b.base, b.primary, b.size.md)" (click)="run(true)">Save (resolves)</button>
      <button [class]="cn(b.base, b.outline, b.size.md)" (click)="run(false)">Save (rejects)</button>
    </div>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                @if (toast.description) {
                  <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
                }
              </div>
              @if (!toast.loading) {
                <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastPromiseExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  run(succeed: boolean): void {
    const request = new Promise<string>((resolve, reject) => {
      setTimeout(() => (succeed ? resolve('report.pdf') : reject(new Error('Network error'))), 1800);
    });

    // Swallow the rejection here; the toast already reflects it.
    this.manager
      .promise(request, {
        loading: { title: 'Saving…', description: 'Uploading your file.' },
        success: (file) => ({ title: 'Saved', description: `${file} is ready.`, type: 'success' }),
        error: (err) => ({ title: 'Failed', description: (err as Error).message, type: 'error' })
      })
      .catch(() => undefined);
  }
}
```

### Types

Branch on a free-form `type` to render an icon, and raise `priority` to `high` for assertive errors.

```typescript
import { Component, inject } from '@angular/core';
import { LucideCircleCheck, LucideCircleX, LucideInfo } from '@lucide/angular';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * `type` is a free-form category surfaced back on the toast object — branch on it in the template
 * (here via an icon) and style with `[data-type]` on the root. `priority: 'high'` switches the
 * announcement role to `alert` (assertive) for errors.
 */
@Component({
  selector: 'toast-types-example',
  imports: [...toastImports, LucideCircleCheck, LucideCircleX, LucideInfo],
  providers: [provideRdxToastManager()],
  template: `
    <div class="flex gap-2">
      <button [class]="cn(b.base, b.outline, b.size.md)" (click)="success()">Success</button>
      <button [class]="cn(b.base, b.outline, b.size.md)" (click)="error()">Error</button>
      <button [class]="cn(b.base, b.outline, b.size.md)" (click)="info()">Info</button>
    </div>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              @switch (toast.type) {
                @case ('success') {
                  <svg [class]="cn(t.icon, 'text-foreground')" lucideCircleCheck></svg>
                }
                @case ('error') {
                  <svg [class]="cn(t.icon, 'text-destructive')" lucideCircleX></svg>
                }
                @default {
                  <svg [class]="cn(t.icon, 'text-muted-foreground')" lucideInfo></svg>
                }
              }
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastTypesExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  success(): void {
    this.manager.add({ type: 'success', title: 'Saved', description: 'Your changes are live.' });
  }

  error(): void {
    this.manager.add({
      type: 'error',
      title: 'Something went wrong',
      description: 'Please try again.',
      priority: 'high'
    });
  }

  info(): void {
    this.manager.add({ type: 'info', title: 'Heads up', description: 'A new version is available.' });
  }
}
```

### Custom position

Placement is the consumer's CSS — here the viewport is anchored top-center and the stack grows down.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * Placement is entirely the consumer's CSS — the primitive only positions nothing. Here the viewport
 * is anchored top-center and the stack grows downward (the stacking variables are styled with
 * flipped signs and `origin-top`). Swipe up to dismiss.
 */
@Component({
  selector: 'toast-custom-position-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Show toast (top)</button>

    <div rdxToastPortal>
      <div [class]="t.viewportTop" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.rootTop" [toast]="toast" [swipeDirection]="['up']" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastCustomPositionExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  private count = 0;

  add(): void {
    this.count++;
    this.manager.add({ title: `Top toast ${this.count}`, description: 'Anchored at the top center.' });
  }
}
```

### Undo action

`rdxToastAction` adds an in-toast action button; this one undoes the change and dismisses the toast.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, RdxToastObject, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * `rdxToastAction` renders an in-toast action button. The label and handler are passed through the
 * toast's `actionProps`; clicking runs the handler and dismisses the toast.
 */
@Component({
  selector: 'toast-undo-action-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <div class="flex items-center gap-3">
      <button [class]="cn(b.base, b.primary, b.size.md)" (click)="archive()">Archive item</button>
      <span class="text-muted-foreground text-sm">Archived: {{ archived }}</span>
    </div>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                @if (toast.actionProps; as action) {
                  <button [class]="t.action" (click)="runAction(toast, $event)" rdxToastAction>
                    {{ action.label }}
                  </button>
                }
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastUndoActionExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  protected archived = 0;

  archive(): void {
    this.archived++;
    this.manager.add({
      title: 'Item archived',
      actionProps: { label: 'Undo', onClick: () => this.archived-- }
    });
  }

  runAction(toast: RdxToastObject, event: MouseEvent): void {
    toast.actionProps?.onClick?.(event);
    this.manager.close(toast.id);
  }
}
```

### Custom data

Attach a typed `data` payload and read it back in the template for rich, app-specific toasts.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

interface MentionData {
  user: string;
  initials: string;
  message: string;
}

/**
 * Toasts carry an arbitrary, typed `data` payload that templates can read back — useful for rich,
 * app-specific content beyond title/description. Here each toast renders an avatar and a mention.
 */
@Component({
  selector: 'toast-custom-data-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <button [class]="cn(b.base, b.primary, b.size.md)" (click)="mention()">New mention</button>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            @let data = $any(toast.data);
            <div [class]="t.content" rdxToastContent>
              <span
                class="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                aria-hidden="true"
              >
                {{ data.initials }}
              </span>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ data.user }} mentioned you</p>
                <p [class]="t.description" rdxToastDescription>“{{ data.message }}”</p>
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastCustomDataExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  private readonly people: MentionData[] = [
    { user: 'Ada Lovelace', initials: 'AL', message: 'Can you review the toast PR?' },
    { user: 'Alan Turing', initials: 'AT', message: 'Shipped the stacking fix 🎉' },
    { user: 'Grace Hopper', initials: 'GH', message: 'Found a bug in the timer logic.' }
  ];

  private next = 0;

  mention(): void {
    const person = this.people[this.next % this.people.length];
    this.next++;
    this.manager.add<MentionData>({ title: `${person.user} mentioned you`, data: person });
  }
}
```

### Deduplicated

Pass a fixed `id` to upsert a single toast in place instead of stacking duplicates.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * Passing a fixed `id` upserts instead of stacking — repeated calls update the same toast in place
 * rather than piling up duplicates. Bumping `updateKey` replays the enter animation, so a rapid
 * second click visibly pulses the existing toast; its auto-dismiss timer restarts each time.
 */
@Component({
  selector: 'toast-deduplicated-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <button [class]="cn(b.base, b.primary, b.size.md)" (click)="copy()">Copy link</button>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastDeduplicatedExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  private times = 0;

  copy(): void {
    this.times++;
    this.manager.add({
      id: 'clipboard',
      title: 'Link copied',
      description: this.times === 1 ? 'Copied to clipboard.' : `Copied ${this.times} times.`,
      updateKey: this.times
    });
  }
}
```

### Varying heights

Measured heights feed `--toast-offset-y`, so the expanded stack lines up even with differing heights.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * Each toast's height is measured and shared as `--toast-offset-y`, so the expanded layout lines up
 * even when toasts differ in height. Add a few (the descriptions vary in length), then hover to
 * expand and watch them stack without overlap.
 */
@Component({
  selector: 'toast-varying-heights-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <div class="flex gap-2">
      <button [class]="cn(b.base, b.primary, b.size.md)" (click)="add()">Add toast</button>
      <button [class]="cn(b.base, b.outline, b.size.md)" (click)="manager.close()">Clear all</button>
    </div>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          <div [class]="t.root" [toast]="toast" rdxToastRoot>
            <div [class]="t.content" rdxToastContent>
              <div class="min-w-0 flex-1">
                <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
              </div>
              <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastVaryingHeightsExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  private readonly bodies = [
    'Short and sweet.',
    'A medium-length message that wraps onto a second line to add some height.',
    'A longer notification that spans several lines so the stacking offsets clearly have to account for differing toast heights when the stack is expanded.'
  ];

  private next = 0;

  add(): void {
    const description = this.bodies[this.next % this.bodies.length];
    this.next++;
    this.manager.add({ title: `Toast ${this.next}`, description, timeout: 0 });
  }
}
```

### Anchored

Pin a toast to an element with `rdxToastPositioner` (powered by popper) instead of joining the stack.

```typescript
import { Component, inject } from '@angular/core';
import { provideRdxToastManager, RdxToastManager, toastImports } from '@radix-ng/primitives/toast';
import { cn, demoButton, demoToast } from '../../storybook/styles';

/**
 * An anchored toast is positioned against an element with `rdxToastPositioner` (powered by popper)
 * instead of joining the stack, with a `rdxToastArrow` pointing back at the anchor. Pass the anchor
 * through the toast's `positionerProps`.
 */
@Component({
  selector: 'toast-anchored-example',
  imports: [...toastImports],
  providers: [provideRdxToastManager()],
  template: `
    <button [class]="cn(b.base, b.primary, b.size.md)" (click)="show($event)">Anchored toast</button>

    <div rdxToastPortal>
      <div [class]="t.viewport" rdxToastViewport>
        @for (toast of manager.toasts(); track toast.id) {
          @if (toast.positionerProps; as positioner) {
            <div [anchor]="positioner.anchor" [side]="positioner.side ?? 'top'" rdxToastPositioner>
              <div [class]="t.anchored" [toast]="toast" rdxToastRoot>
                <div [class]="t.content" rdxToastContent>
                  <div class="min-w-0 flex-1">
                    <p [class]="t.title" rdxToastTitle>{{ toast.title }}</p>
                    <p [class]="t.description" rdxToastDescription>{{ toast.description }}</p>
                  </div>
                  <button [class]="t.close" aria-label="Dismiss" rdxToastClose>✕</button>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ToastAnchoredExample {
  protected readonly manager = inject(RdxToastManager);
  protected readonly cn = cn;
  protected readonly b = demoButton;
  protected readonly t = demoToast;

  show(event: MouseEvent): void {
    this.manager.add({
      id: 'anchored',
      title: 'Anchored toast',
      description: 'Pinned to the button, with an arrow.',
      timeout: 0,
      positionerProps: { anchor: event.currentTarget as HTMLElement, side: 'top' }
    });
  }
}
```

## Data attributes

| Attribute              | Part | Present when                                            |
| ---------------------- | ---- | ------------------------------------------------------- |
| `data-state`           | Root | `open` while visible, `closed` once dismissal begins    |
| `data-front`           | Root | this is the frontmost toast (`--toast-index` is `0`)    |
| `data-expanded`        | Root | the viewport is hovered or focused                      |
| `data-type`            | Root | the toast has a `type`                                  |
| `data-swiping`         | Root | a swipe gesture is active                               |
| `data-swipe-direction` | Root | the active swipe direction (`up`/`down`/`left`/`right`) |
| `data-swipe-dismiss`   | Root | a release committed to dismissal                        |

The root also writes CSS variables for styling: `--toast-index`, `--toast-height`,
`--toast-offset-y`, and `--toast-swipe-movement-x` / `--toast-swipe-movement-y`.

## API Reference

### RdxToastProvider

Hosts the `RdxToastManager` for its subtree (`[rdxToastProvider]`).

### RdxToastRoot

A single toast. Bind the toast model from the viewport's `@for`.

### RdxToastPositioner

Anchors a toast to an element via popper. Forwards the popper positioning inputs (`anchor`, `side`,
`sideOffset`, `align`, `alignOffset`, `arrowPadding`, `avoidCollisions`, `collisionPadding`, …).

### Other parts

`RdxToastPortal`, `RdxToastViewport`, `RdxToastContent`, `RdxToastTitle`, `RdxToastDescription`,
`RdxToastClose` and `RdxToastAction` take no inputs of their own — they read from the toast root
context and the manager. `RdxToastPortal` forwards a `container` input to the underlying portal.
