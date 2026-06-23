# LiveAnnouncer

#### Announces messages to screen readers through an `aria-live` region, without moving focus.

The buttons below send messages to the live region. It is visually hidden, so the on-screen log
mirrors what assistive technology reads aloud.

```typescript
import { cn, demoButton } from '../../storybook/styles';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RdxLiveAnnouncer } from '@radix-ng/primitives/core';

/**
 * Triggers screen-reader announcements through `RdxLiveAnnouncer`. The live region is visually
 * hidden, so the on-screen log below mirrors what was sent to assistive technology.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'live-announcer-example',
    imports: [],
    template: `
        <div class="flex w-80 flex-col gap-4">
            <div class="flex gap-2">
                <button type="button" [class]="cn(b.base, b.primary, b.size.md)" (click)="announce('polite')">
                    Announce (polite)
                </button>
                <button type="button" [class]="cn(b.base, b.outline, b.size.md)" (click)="announce('assertive')">
                    Announce (assertive)
                </button>
            </div>

            <p class="text-muted-foreground text-sm">
                The live region is visually hidden — a screen reader reads each message aloud. The log below mirrors
                what was announced.
            </p>

            <ul class="border-border flex flex-col gap-1 rounded-md border p-3 text-sm">
                @for (entry of log(); track entry.id) {
                    <li class="text-foreground flex items-center justify-between gap-2">
                        <span>{{ entry.message }}</span>
                        <code class="text-muted-foreground text-xs">aria-live="{{ entry.politeness }}"</code>
                    </li>
                } @empty {
                    <li class="text-muted-foreground">Nothing announced yet.</li>
                }
            </ul>
        </div>
    `
})
export class LiveAnnouncerExample {
    private readonly announcer = inject(RdxLiveAnnouncer);

    private count = 0;

    readonly log = signal<{ id: number; message: string; politeness: 'polite' | 'assertive' }[]>([]);

    protected readonly cn = cn;
    protected readonly b = demoButton;

    announce(politeness: 'polite' | 'assertive'): void {
        this.count += 1;
        const message = `Notification ${this.count}`;

        this.announcer.announce(message, politeness);
        this.log.update((entries) => [{ id: this.count, message, politeness }, ...entries]);
    }
}
```

## Features

- ✅ Lazily appends a single visually hidden `aria-live` region to `document.body`.
- ✅ Polite or assertive announcements via the `politeness` argument.
- ✅ Optional auto-clear after a given duration.
- ✅ SSR safe — a no-op on the server.
- ✅ Cleans up its region on destroy.

## Import

```typescript
import { RdxLiveAnnouncer } from '@radix-ng/primitives/core';
```

## Usage

Inject the service and call `announce(message, politeness?, duration?)`. `politeness` defaults to
`'polite'`; pass a `duration` (ms) to clear the message automatically.

```typescript
import { Component, inject } from '@angular/core';
import { RdxLiveAnnouncer } from '@radix-ng/primitives/core';

@Component({ /* … */ })
export class StepperComponent {
    private readonly announcer = inject(RdxLiveAnnouncer);

    goToStep(step: number, total: number): void {
        this.announcer.announce(`Step ${step} of ${total}`);
    }
}
```

## API

### RdxLiveAnnouncer

- `announce(message: string, politeness?: 'off' | 'polite' | 'assertive', duration?: number): void` —
  writes `message` into the live region. `politeness` sets `aria-live` (default `'polite'`); when
  `duration` is provided, the message is cleared after that many milliseconds.
- `clear(): void` — empties the live region.
