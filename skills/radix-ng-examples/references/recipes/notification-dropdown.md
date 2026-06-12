# Notification Dropdown

#### A bell trigger opening a scrollable list of notifications with an unread badge.

This is a composition, not a primitive. The [Popover](?path=/docs/primitives-popover--docs) provides
the anchored, dismissable panel and its focus management; the
[ScrollArea](?path=/docs/primitives-scroll-area--docs) provides the custom scrollbar over a long list.
The recipe adds the unread count badge, per-item read state, and "mark all read".

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideBell, LucideCheckCheck } from '@lucide/angular';
import { popoverImports } from '@radix-ng/primitives/popover';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';
import { cn, demoButton, demoCard, demoPopover } from '../storybook/styles';

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
        ...popoverImports,
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
                [class]="cn(b.base, b.outline, b.size.icon, 'relative')"
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

            <div
                *rdxPopoverPortal
                [class]="cn(p.positioner, p.positionerAnimated)"
                sideOffset="8"
                align="end"
                rdxPopoverPositioner
            >
                <div [class]="popup" rdxPopoverPopup>
                    <div class="border-border flex items-center justify-between border-b px-4 py-3">
                        <h2 [class]="p.title" rdxPopoverTitle>Notifications</h2>
                        <button
                            [class]="cn(b.base, b.ghost, b.size.sm, 'gap-1.5 text-xs')"
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
                        <button [class]="cn(b.base, b.ghost, b.size.sm, 'w-full')">View all notifications</button>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class NotificationDropdownExample {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;

    /** Panel surface: a card with no padding so the header, list, and footer span full width. */
    protected readonly popup = cn(demoCard, 'relative w-80 overflow-hidden', demoPopover.popupAnimated);

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

- **[Popover](?path=/docs/primitives-popover--docs)** (`rdxPopoverRoot` / `rdxPopoverTrigger` /
  `rdxPopoverPortal` / `rdxPopoverPositioner` / `rdxPopoverPopup` / `rdxPopoverTitle`) — the bell
  trigger and the anchored panel.
- **[ScrollArea](?path=/docs/primitives-scroll-area--docs)** (`rdxScrollAreaRoot` / `…Viewport` /
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
import { popoverImports } from '@radix-ng/primitives/popover';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';
import { cn, demoButton, demoCard, demoPopover } from '../storybook/styles';

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
        ...popoverImports,
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
                [class]="cn(b.base, b.outline, b.size.icon, 'relative')"
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

            <div
                *rdxPopoverPortal
                [class]="cn(p.positioner, p.positionerAnimated)"
                sideOffset="8"
                align="end"
                rdxPopoverPositioner
            >
                <div [class]="popup" rdxPopoverPopup>
                    <div class="border-border flex items-center justify-between border-b px-4 py-3">
                        <h2 [class]="p.title" rdxPopoverTitle>Notifications</h2>
                        <button
                            [class]="cn(b.base, b.ghost, b.size.sm, 'gap-1.5 text-xs')"
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
                        <button [class]="cn(b.base, b.ghost, b.size.sm, 'w-full')">View all notifications</button>
                    </div>
                </div>
            </div>
        </ng-container>
    `
})
export class NotificationDropdownExample {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly p = demoPopover;

    /** Panel surface: a card with no padding so the header, list, and footer span full width. */
    protected readonly popup = cn(demoCard, 'relative w-80 overflow-hidden', demoPopover.popupAnimated);

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
[LiveAnnouncer](?path=/docs/utilities-liveannouncer--docs) so they reach screen readers even when the
panel is closed.

### Keyboard Interactions

| Key               | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `Enter` / `Space` | Opens the panel when the trigger is focused; activates the focused item.   |
| `Tab`             | Moves focus into and through the panel — the actions and notification list. |
| `Escape`          | Closes the panel and returns focus to the trigger.                         |
