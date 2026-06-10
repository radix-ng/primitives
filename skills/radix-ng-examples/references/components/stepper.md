# Stepper

####  A set of steps that are used to indicate progress through a multi-step process.

```html
<div rdxStepperRoot [value]="2" class="flex w-full max-w-xl gap-4">
    @for (item of steps; track $index) {
        <div
            rdxStepperItem
            [step]="item.step"
            class="group relative flex flex-1 flex-col items-center px-4 data-[disabled]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50"
        >
            @if (item.step !== steps[steps.length - 1].step) {
                <div
                    rdxStepperSeparator
                    class="bg-border absolute top-[21px] right-[calc(-50%+20px)] left-[calc(50%+30px)] h-px"
                ></div>
            }
            <button
                rdxStepperTrigger
                class="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-full focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)]"
            >
                <div
                    rdxStepperIndicator
                    class="bg-background text-foreground group-data-[state=inactive]:bg-muted group-data-[state=inactive]:text-muted-foreground group-data-[state=active]:bg-foreground group-data-[state=active]:text-background group-data-[state=completed]:bg-primary group-data-[state=completed]:text-primary-foreground inline-flex h-6 w-6 items-center justify-center rounded-full [box-shadow:0_0_0_2px_var(--border)] group-data-[state=active]:[box-shadow:0_0_0_2px_var(--foreground)] group-data-[state=completed]:[box-shadow:0_0_0_2px_var(--primary)]"
                >
                    {{$index+1}}
                </div>
            </button>
            <div class="text-muted-foreground mt-2 w-full text-center">
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

## Features

- ✅ Can be controlled or uncontrolled.
- ✅ Supports horizontal/vertical orientation.
- ✅ Supports linear/non-linear activation.
- ✅ Full keyboard navigation.

## Anatomy

Import all parts and piece them together.

```html
<div rdxStepperRoot >
    <div rdxStepperItem >
        <div rdxStepperSeparator></div>
        <button rdxStepperTrigger>
            <div rdxStepperIndicator></div>
        </button>

        <h4 rdxStepperTitle></h4>
        <p rdxStepperDescription></p>
    </div>
</div>
```

## API Reference

### Root

`RdxStepperRootDirective`

### Item

`RdxStepperItemDirective`

The step item component.

## Examples

### Vertical

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

### Navigation

```html
<StepperNavigation />
```

## Accessibility

### Keyboard Interactions

| Key | Description |
| --- | ----------- |
| `Enter` / `Space` | Activates the focused step trigger, setting it as the current step. |
| `ArrowRight` / `ArrowDown` | Moves focus to the next step trigger (respects orientation). |
| `ArrowLeft` / `ArrowUp` | Moves focus to the previous step trigger (respects orientation). |
