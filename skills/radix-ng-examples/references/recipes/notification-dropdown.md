# Notification Dropdown

#### A bell trigger opening a scrollable list of notifications with an unread badge.

This is a composition, not a primitive. The [Popover](../components/popover.md) provides
the anchored, dismissable panel and its focus management; the
[ScrollArea](../components/scroll-area.md) provides the custom scrollbar over a long list.
The recipe adds the unread count badge, per-item read state, and "mark all read".

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideBell, LucideCheckCheck } from '@lucide/angular';
import {
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

/**
 * Notification Dropdown — a bell trigger opening a scrollable notification list.
 *
 * Composition only: the [Popover] primitive owns the anchored, dismissable panel and its focus
 * management, and the [ScrollArea] primitive owns the custom scrollbar over the list. The recipe adds
 * the unread badge, the per-item read state, and "mark all read".
 */
@Component({
    selector: 'notification-dropdown-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverTitle,
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb,
        LucideBell,
        LucideCheckCheck
    ],
    template: `
        <ng-container rdxPopoverRoot>
            <button
                class="demo-button demo-button-outline relative size-9 p-0"
                aria-label="Notifications"
                rdxPopoverTrigger
            >
                <svg aria-hidden="true" lucideBell size="18"></svg>
                @if (unreadCount() > 0) {
                    <span
                        class="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium"
                    >
                        {{ unreadCount() }}
                    </span>
                }
            </button>

            <div class="z-50" *rdxPopoverPortal sideOffset="8" align="end" rdxPopoverPositioner>
                <div
                    class="demo-surface data-[open]:animate-popover-popup-in data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative w-80 overflow-hidden"
                    rdxPopoverPopup
                >
                    <div class="border-border flex items-center justify-between border-b px-4 py-3">
                        <h2 class="demo-popover-title" rdxPopoverTitle>Notifications</h2>
                        <button
                            class="demo-button demo-button-ghost h-8 gap-1.5 px-3 text-xs"
                            [disabled]="unreadCount() === 0"
                            (click)="markAllRead()"
                        >
                            <svg aria-hidden="true" lucideCheckCheck size="14"></svg>
                            Mark all read
                        </button>
                    </div>

                    <div class="relative h-72 overflow-hidden" rdxScrollAreaRoot>
                        <div class="h-full w-full" rdxScrollAreaViewport>
                            <div rdxScrollAreaContent>
                                @for (n of notifications(); track n.id) {
                                    <button
                                        class="border-border/60 hover:bg-muted flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0"
                                        (click)="markRead(n.id)"
                                    >
                                        <span
                                            class="mt-1.5 size-2 shrink-0 rounded-full"
                                            [class.bg-primary]="!n.read"
                                            [class.bg-transparent]="n.read"
                                            aria-hidden="true"
                                        ></span>
                                        <span class="min-w-0 flex-1">
                                            <span class="text-foreground block text-sm font-medium">
                                                {{ n.title }}
                                            </span>
                                            <span class="text-muted-foreground block text-xs">
                                                {{ n.message }}
                                            </span>
                                            <span class="text-muted-foreground/70 mt-1 block text-[11px]">
                                                {{ n.time }}
                                            </span>
                                        </span>
                                    </button>
                                }
                            </div>
                        </div>

                        <div
                            class="data-[scrolling]:bg-muted/40 flex w-2.5 touch-none p-0.5 transition-opacity select-none"
                            orientation="vertical"
                            rdxScrollAreaScrollbar
                        >
                            <div
                                class="bg-foreground/30 hover:bg-foreground/50 w-full rounded-full transition-colors"
                                rdxScrollAreaThumb
                            ></div>
                        </div>
                    </div>

                    <div class="border-border border-t px-2 py-2">
                        <button class="demo-button demo-button-ghost h-8 w-full px-3 text-xs">
                            View all notifications
                        </button>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class NotificationDropdownExample {
    protected readonly notifications = signal<Notification[]>([
        { id: 1, title: 'New comment', message: 'Alex commented on your pull request.', time: '2m ago', read: false },
        { id: 2, title: 'Build passed', message: 'CI finished for main in 3m 12s.', time: '10m ago', read: false },
        { id: 3, title: 'New follower', message: 'Sam started following you.', time: '1h ago', read: false },
        { id: 4, title: 'Mention', message: 'You were mentioned in #general.', time: '3h ago', read: true },
        { id: 5, title: 'Deployment', message: 'v1.0.0-beta.1 deployed to production.', time: '5h ago', read: true },
        { id: 6, title: 'Invitation', message: 'You were invited to the Design team.', time: '1d ago', read: true },
        { id: 7, title: 'Storage', message: "You've used 80% of your storage.", time: '2d ago', read: true },
        { id: 8, title: 'Weekly digest', message: 'Your weekly summary is ready.', time: '3d ago', read: true }
    ]);

    protected readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

    protected markRead(id: number): void {
        this.notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }

    protected markAllRead(): void {
        this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    }
}
```

## Composed from

- **[Popover](../components/popover.md)** (`rdxPopoverRoot` / `rdxPopoverTrigger` /
  `rdxPopoverPortal` / `rdxPopoverPositioner` / `rdxPopoverPopup` / `rdxPopoverTitle`) — the bell
  trigger and the anchored panel.
- **[ScrollArea](../components/scroll-area.md)** (`rdxScrollAreaRoot` / `…Viewport` /
  `…Content` / `…Scrollbar` / `…Thumb`) — the scrollable notification list with a styled scrollbar.

## Anatomy

A popover panel with three regions — a header, a scroll area holding the list, and a footer. The list
lives inside the scroll area's `Content`; the vertical `Scrollbar` and `Thumb` sit beside the viewport.

```html
<ng-container rdxPopoverRoot>
    <button aria-label="Notifications" rdxPopoverTrigger>
        <svg lucideBell></svg>
        <!-- unread badge -->
    </button>

    <div *rdxPopoverPortal sideOffset="8" align="end" rdxPopoverPositioner>
        <div rdxPopoverPopup>
            <div><!-- header: title + "Mark all read" --></div>

            <div rdxScrollAreaRoot>
                <div rdxScrollAreaViewport>
                    <div rdxScrollAreaContent>
                        <!-- one button per notification -->
                    </div>
                </div>
                <div orientation="vertical" rdxScrollAreaScrollbar>
                    <div rdxScrollAreaThumb></div>
                </div>
            </div>

            <div><!-- footer: "View all" --></div>
        </div>
    </div>
</ng-container>
```

## Examples

### Default

A bell button shows the unread count. Opening the popover reveals the list; clicking a notification
marks it read, and "Mark all read" clears the badge.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideBell, LucideCheckCheck } from '@lucide/angular';
import {
    RdxPopoverPopup,
    RdxPopoverPortal,
    RdxPopoverPositioner,
    RdxPopoverRoot,
    RdxPopoverTitle,
    RdxPopoverTrigger
} from '@radix-ng/primitives/popover';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

/**
 * Notification Dropdown — a bell trigger opening a scrollable notification list.
 *
 * Composition only: the [Popover] primitive owns the anchored, dismissable panel and its focus
 * management, and the [ScrollArea] primitive owns the custom scrollbar over the list. The recipe adds
 * the unread badge, the per-item read state, and "mark all read".
 */
@Component({
    selector: 'notification-dropdown-example',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RdxPopoverRoot,
        RdxPopoverTrigger,
        RdxPopoverPortal,
        RdxPopoverPositioner,
        RdxPopoverPopup,
        RdxPopoverTitle,
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb,
        LucideBell,
        LucideCheckCheck
    ],
    template: `
        <ng-container rdxPopoverRoot>
            <button
                class="demo-button demo-button-outline relative size-9 p-0"
                aria-label="Notifications"
                rdxPopoverTrigger
            >
                <svg aria-hidden="true" lucideBell size="18"></svg>
                @if (unreadCount() > 0) {
                    <span
                        class="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium"
                    >
                        {{ unreadCount() }}
                    </span>
                }
            </button>

            <div class="z-50" *rdxPopoverPortal sideOffset="8" align="end" rdxPopoverPositioner>
                <div
                    class="demo-surface data-[open]:animate-popover-popup-in data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out relative w-80 overflow-hidden"
                    rdxPopoverPopup
                >
                    <div class="border-border flex items-center justify-between border-b px-4 py-3">
                        <h2 class="demo-popover-title" rdxPopoverTitle>Notifications</h2>
                        <button
                            class="demo-button demo-button-ghost h-8 gap-1.5 px-3 text-xs"
                            [disabled]="unreadCount() === 0"
                            (click)="markAllRead()"
                        >
                            <svg aria-hidden="true" lucideCheckCheck size="14"></svg>
                            Mark all read
                        </button>
                    </div>

                    <div class="relative h-72 overflow-hidden" rdxScrollAreaRoot>
                        <div class="h-full w-full" rdxScrollAreaViewport>
                            <div rdxScrollAreaContent>
                                @for (n of notifications(); track n.id) {
                                    <button
                                        class="border-border/60 hover:bg-muted flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0"
                                        (click)="markRead(n.id)"
                                    >
                                        <span
                                            class="mt-1.5 size-2 shrink-0 rounded-full"
                                            [class.bg-primary]="!n.read"
                                            [class.bg-transparent]="n.read"
                                            aria-hidden="true"
                                        ></span>
                                        <span class="min-w-0 flex-1">
                                            <span class="text-foreground block text-sm font-medium">
                                                {{ n.title }}
                                            </span>
                                            <span class="text-muted-foreground block text-xs">
                                                {{ n.message }}
                                            </span>
                                            <span class="text-muted-foreground/70 mt-1 block text-[11px]">
                                                {{ n.time }}
                                            </span>
                                        </span>
                                    </button>
                                }
                            </div>
                        </div>

                        <div
                            class="data-[scrolling]:bg-muted/40 flex w-2.5 touch-none p-0.5 transition-opacity select-none"
                            orientation="vertical"
                            rdxScrollAreaScrollbar
                        >
                            <div
                                class="bg-foreground/30 hover:bg-foreground/50 w-full rounded-full transition-colors"
                                rdxScrollAreaThumb
                            ></div>
                        </div>
                    </div>

                    <div class="border-border border-t px-2 py-2">
                        <button class="demo-button demo-button-ghost h-8 w-full px-3 text-xs">
                            View all notifications
                        </button>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class NotificationDropdownExample {
    protected readonly notifications = signal<Notification[]>([
        { id: 1, title: 'New comment', message: 'Alex commented on your pull request.', time: '2m ago', read: false },
        { id: 2, title: 'Build passed', message: 'CI finished for main in 3m 12s.', time: '10m ago', read: false },
        { id: 3, title: 'New follower', message: 'Sam started following you.', time: '1h ago', read: false },
        { id: 4, title: 'Mention', message: 'You were mentioned in #general.', time: '3h ago', read: true },
        { id: 5, title: 'Deployment', message: 'v1.0.0-beta.1 deployed to production.', time: '5h ago', read: true },
        { id: 6, title: 'Invitation', message: 'You were invited to the Design team.', time: '1d ago', read: true },
        { id: 7, title: 'Storage', message: "You've used 80% of your storage.", time: '2d ago', read: true },
        { id: 8, title: 'Weekly digest', message: 'Your weekly summary is ready.', time: '3d ago', read: true }
    ]);

    protected readonly unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

    protected markRead(id: number): void {
        this.notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }

    protected markAllRead(): void {
        this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    }
}
```

## Accessibility

Give the icon-only trigger an `aria-label`. The Popover primitive manages focus (moving it into the
panel and restoring it on close) and dismissal (Escape and outside-pointer). Each notification is a real
`<button>`, so the list is fully keyboard operable. For live updates, announce new notifications with the
[LiveAnnouncer](../utils/live-announcer.md) so they reach screen readers even when the
panel is closed.

### Keyboard Interactions

| Key               | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `Enter` / `Space` | Opens the panel when the trigger is focused; activates the focused item.   |
| `Tab`             | Moves focus into and through the panel — the actions and notification list. |
| `Escape`          | Closes the panel and returns focus to the trigger.                         |

## Setup and shared files

These examples use Angular standalone components and Tailwind CSS v4. Install
`@radix-ng/primitives` and `@lucide/angular`. Copy the component from **Show code** and any shared files below,
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
