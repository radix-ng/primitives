# Roving Focus

```html
<section class="w-full max-w-2xl space-y-4">
  <h2 class="text-foreground text-lg font-semibold">Horizontal Navigation with Looping</h2>
  <p class="text-muted-foreground text-sm leading-6">
    Use the ArrowLeft and ArrowRight keys to navigate between buttons. Ensure that when reaching the end of the group,
    the focus cycles back to the first item (and vice versa).
  </p>
  <div class="flex gap-2" rdxRovingFocusGroup [orientation]="'horizontal'" [loop]="true">
    <button
      class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
      rdxRovingFocusItem
    >
      Item 1
    </button>
    <button
      class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
      rdxRovingFocusItem
    >
      Item 2
    </button>
    <button
      class="border-border bg-background text-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
      rdxRovingFocusItem
    >
      Item 3
    </button>
  </div>
</section>
```

## Anatomy

```html
<div rdxRovingFocusGroup>
  <button rdxRovingFocusItem></button>
  <button rdxRovingFocusItem></button>
  <button rdxRovingFocusItem></button>
</div>
```

## API Reference

### Focus Group

The `RdxRovingFocusGroupDirective` allows managing focus within a group of elements, such as buttons, links, or any interactive items. It provides an accessible navigation pattern for keyboard users and ensures intuitive interaction.

#### Usage

This directive can be added to a container element, and all its focusable children will be managed as a group.

### Focus Item

The `RdxRovingFocusItemDirective` is a companion directive to `RdxRovingFocusGroupDirective`. It manages individual items within the group, ensuring smooth keyboard navigation and intuitive focus behavior.

#### Usage

This directive should be used on individual elements (e.g., buttons or links) within a container that has the `RdxRovingFocusGroupDirective`.
