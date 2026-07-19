# Separator — Vertical

> One example from the [Separator](../components/separator.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

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
