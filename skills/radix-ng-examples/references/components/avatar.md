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

### Image

### Fallback
