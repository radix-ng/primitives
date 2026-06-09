# Separator

#### A separator element accessible to screen readers.

```html
<div class="flex w-full max-w-lg items-center text-sm">
  <nav class="flex items-center gap-4" aria-label="Main">
    <a class="text-foreground hover:text-primary transition-colors" href="#">Home</a>
    <a class="text-foreground hover:text-primary transition-colors" href="#">Pricing</a>
    <a class="text-foreground hover:text-primary transition-colors" href="#">Blog</a>
    <a class="text-foreground hover:text-primary transition-colors" href="#">Support</a>
  </nav>

  <div class="bg-border mx-5 h-5 w-px shrink-0" rdxSeparatorRoot orientation="vertical"></div>

  <div class="flex items-center gap-4">
    <a class="text-foreground hover:text-primary transition-colors" href="#">Log in</a>
    <a
      class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 font-medium transition-colors"
      href="#"
    >
      Sign up
    </a>
  </div>
</div>
```

## Features

- ✅ Supports horizontal and vertical orientations.
- ✅ Exposes orientation state via the `data-orientation` attribute.
- ✅ Uses the `separator` role and sets `aria-orientation` for vertical separators.

## Import

```typescript
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';
```

## Anatomy

Separator is a single directive. Apply `rdxSeparatorRoot` to the element that separates content.

```html
<div rdxSeparatorRoot></div>
```

## Examples

### Vertical

Use `orientation="vertical"` when separating inline content groups.

```html
<div class="flex w-full max-w-lg items-center text-sm">
  <nav class="flex items-center gap-4" aria-label="Main">
    <a class="text-foreground hover:text-primary transition-colors" href="#">Home</a>
    <a class="text-foreground hover:text-primary transition-colors" href="#">Pricing</a>
    <a class="text-foreground hover:text-primary transition-colors" href="#">Blog</a>
    <a class="text-foreground hover:text-primary transition-colors" href="#">Support</a>
  </nav>

  <div class="bg-border mx-5 h-5 w-px shrink-0" rdxSeparatorRoot orientation="vertical"></div>

  <div class="flex items-center gap-4">
    <a class="text-foreground hover:text-primary transition-colors" href="#">Log in</a>
    <a
      class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 font-medium transition-colors"
      href="#"
    >
      Sign up
    </a>
  </div>
</div>
```

### Horizontal

The default orientation is horizontal.

```html
<div class="flex w-full max-w-sm flex-col gap-3">
  <div>
    <h3 class="text-foreground text-sm font-medium">Radix NG Primitives</h3>
    <p class="text-muted-foreground mt-1 text-sm">Headless Angular primitives modeled after Base UI.</p>
  </div>

  <div class="bg-border h-px w-full" rdxSeparatorRoot></div>

  <div class="text-muted-foreground text-sm">Composable directives with state exposed through data attributes.</div>
</div>
```

## API Reference
