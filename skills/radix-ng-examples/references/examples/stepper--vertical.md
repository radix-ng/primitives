# Stepper — Vertical

> One example from the [Stepper](../components/stepper.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

```html
<div rdxStepperRoot [value]="2" orientation="vertical" class="flex w-full max-w-sm flex-col gap-5">
    @for (item of steps; track $index) {
        <div
            rdxStepperItem
            [step]="item.step"
            class="group relative flex items-start gap-3 data-[disabled]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
        >
            @if (item.step !== steps[steps.length - 1].step) {
                <div
                    rdxStepperSeparator
                    class="bg-border absolute top-10 -bottom-5 left-5 w-px -translate-x-1/2"
                ></div>
            }
            <button
                rdxStepperTrigger
                class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)]"
            >
                <div
                    rdxStepperIndicator
                    class="bg-background text-foreground group-data-[state=inactive]:bg-muted group-data-[state=inactive]:text-muted-foreground group-data-[state=active]:bg-foreground group-data-[state=active]:text-background group-data-[state=completed]:bg-primary group-data-[state=completed]:text-primary-foreground inline-flex h-6 w-6 items-center justify-center rounded-full [box-shadow:0_0_0_2px_var(--border)] group-data-[state=active]:[box-shadow:0_0_0_2px_var(--foreground)] group-data-[state=completed]:[box-shadow:0_0_0_2px_var(--primary)]"
                >
                    {{$index+1}}
                </div>
            </button>
            <div class="text-muted-foreground mt-1 text-left">
                <h4 class="text-foreground text-sm font-medium">
                   {{ item.title }}
                </h4>
                <p class="text-muted-foreground text-xs">
                   {{ item.description }}
                </p>
            </div>
        </div>
    }
</div>
```
