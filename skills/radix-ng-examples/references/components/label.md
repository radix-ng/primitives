# Label

#### Renders an accessible label associated with controls.

```html
<div class="flex items-center gap-3">
  <label class="text-foreground text-sm leading-9 font-medium" rdxLabel htmlFor="uniqId">First Name</label>
  <input
    class="bg-background text-foreground border-border focus-visible:ring-ring h-9 w-52 rounded-md border px-3 text-sm shadow-sm outline-none focus-visible:ring-2"
    id="uniqId"
    type="text"
  />
</div>
```

## Features

- ✅ Text selection is prevented when double-clicking label.

## Import

Get started with importing the directive:

```typescript
import { RdxLabelDirective } from '@radix-ng/primitives/label';
```

## Examples

```html
<label rdxLabel htmlFor="uniqId">First name</label>
<input class="Input" id="uniqId" type="text" />
```

## API Reference

## Accessibility

This component is based on the native `label` element, it will automatically apply the correct labelling
when wrapping controls or using the `for` attribute. For your own custom controls
to work correctly, ensure they use native elements such as `button` or `input` as a base.
