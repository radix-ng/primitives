# Avatar

An image element with a fallback for representing the user.

> Index — full source of each example is one click away in `../examples/avatar--*.md`; the whole-doc dump is in `../llms-full.txt`.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

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

## Examples

- [Sizes](../examples/avatar--sizes.md)
- [Fallback](../examples/avatar--fallback.md)
- [Delayed fallback](../examples/avatar--delayed-fallback.md)

## API & styling contract

Machine-readable contracts for this primitive live in the `radix-ng` skill:
- API (selectors, inputs, outputs, two-way bindings): `references/api-contract/avatar.json`
- Styling (parts + `data-*`): `references/styling-contract/avatar.json`
