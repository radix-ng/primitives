# Avatar

#### An image element with a fallback for representing the user.

```html
<rdx-avatar-demo />
```

## Features

- ✅ Automatic and manual control over when the image renders.
- ✅ Fallback part accepts any children.
- ✅ Optionally delay fallback rendering to avoid content flashing.

## Import

```typescript
import {
  RdxAvatarRootDirective,
  RdxAvatarImageDirective,
  RdxAvatarFallbackDirective
} from '@radix-ng/primitives/avatar';
```

## Anatomy

Assemble the parts: a root, the image, and a fallback shown until the image loads.

```html
<span rdxAvatarRoot>
  <img rdxAvatarImage src="..." alt="..." />
  <span rdxAvatarFallback>AB</span>
</span>
```

## Global configuration

Configure the default options for all avatars with `provideRdxAvatarConfig` in a providers array.

```ts
import { provideRdxAvatarConfig } from '@radix-ng/primitives/avatar';

bootstrapApplication(AppComponent, {
  providers: [provideRdxAvatarConfig({ delayMs: 1000 })]
});
```

## Examples

### Sizes

`sm`, `md`, and `lg` from the demo style layer.

```html
<rdx-avatar-sizes />
```

### Fallback

The fallback renders when there is no image or the image fails to load.

```html
<rdx-avatar-fallback />
```

### Delayed fallback

`delayMs` waits before showing the fallback, so it only appears for slower connections.

```html
<rdx-avatar-delay />
```

## API Reference

### Root

`RdxAvatarRootDirective` — provides the shared image loading status. Apply to a `<span>`. It takes no
inputs and exposes no data attributes (matching Base UI, which surfaces the loading status through the
context, not the DOM).

### Image

`RdxAvatarImageDirective` — apply to an `<img>`. It loads the image off-DOM and reveals it only once
loaded; it carries no role (the native `<img>` role is used) and no data attributes.

### Fallback

`RdxAvatarFallbackDirective` — apply to a `<span>`. Shown until the image loads (optionally after
`delayMs`). It exposes no data attributes.

## Accessibility

Give the `<img rdxAvatarImage>` a meaningful `alt`, and put a meaningful label in the fallback (e.g.
the person's name rather than bare initials) so it remains understandable to assistive technology when
the image fails to load.
