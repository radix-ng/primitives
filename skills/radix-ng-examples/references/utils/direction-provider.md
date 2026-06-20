# Direction Provider

#### Provides reading direction to descendant primitives through Angular DI.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Direction } from '@radix-ng/primitives/core';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack
} from '@radix-ng/primitives/slider';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'direction-provider-slider-example',
    imports: [
        RdxDirectionProvider,
        RdxSliderRoot,
        RdxSliderControl,
        RdxSliderTrack,
        RdxSliderIndicator,
        RdxSliderThumb,
        RdxSliderThumbInput
    ],
    template: `
        <div class="grid w-[520px] max-w-full gap-6 sm:grid-cols-2">
            @for (item of directions; track item.direction) {
                <section
                    class="border-border bg-card text-card-foreground grid gap-4 rounded-md border p-4 shadow-sm"
                    [attr.dir]="item.direction"
                    [direction]="item.direction"
                    rdxDirectionProvider
                >
                    <div class="flex items-center justify-between gap-3">
                        <span class="text-sm font-medium">{{ item.label }}</span>
                        <span class="text-muted-foreground text-xs tabular-nums">{{ item.value() }}</span>
                    </div>

                    <div
                        class="relative w-full select-none"
                        [(value)]="item.value"
                        [min]="0"
                        [max]="100"
                        [step]="5"
                        rdxSliderRoot
                    >
                        <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                            <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                                <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                                <div
                                    class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                                    rdxSliderThumb
                                >
                                    <input [attr.aria-label]="item.label" rdxSliderThumbInput />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </div>
    `
})
export class DirectionProviderSliderExample {
    protected readonly directions: Array<{
        direction: Direction;
        label: string;
        value: ReturnType<typeof signal<number>>;
    }> = [
        { direction: 'ltr', label: 'Left to right', value: signal(65) },
        { direction: 'rtl', label: 'Right to left', value: signal(65) }
    ];
}
```

## Features

- ✅ Provides primitive behavior direction through `RDX_DIRECTION`.
- ✅ Supports local subtree direction with `[rdxDirectionProvider]`.
- ✅ Supports app-level direction through `provideRadixNG({ dir })`.
- ✅ Local primitive `[dir]` inputs still override provider direction.

## Import

```typescript
import { RdxDirectionProvider, provideDirection } from '@radix-ng/primitives/direction-provider';
```

## Usage

### App-level direction

Set a global primitive direction in your application config:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRadixNG } from '@radix-ng/primitives/config';

export const appConfig: ApplicationConfig = {
    providers: [provideRadixNG({ dir: 'rtl' })]
};
```

All primitives that read direction inherit this value unless they receive a local `[dir]` override or a
nearer direction provider.

### Subtree direction

```html
<section dir="rtl" direction="rtl" rdxDirectionProvider>
    <div rdxSliderRoot>
        <!-- Slider parts -->
    </div>
</section>
```

`rdxDirectionProvider` controls primitive behavior. Use the native `dir` attribute or CSS direction when
the DOM itself should render right-to-left.

### DI direction

For a feature boundary, provide direction directly through DI:

```typescript
import { provideDirection } from '@radix-ng/primitives/direction-provider';

@Component({
    providers: [provideDirection('rtl')]
})
export class RtlFeature {}
```
