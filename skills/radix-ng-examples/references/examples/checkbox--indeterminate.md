# Checkbox — Indeterminate

> One example from the [Checkbox](../components/checkbox.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

The third "mixed" state. Clicking a checkbox in the indeterminate state resolves it to checked.

```typescript
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { RdxCheckboxButtonDirective } from '@radix-ng/primitives/checkbox';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { cn, demoButton, demoCheckbox } from '../../storybook/styles';
import { RdxCheckboxIndicatorDirective } from '../src/checkbox-indicator';
import { RdxCheckboxInputDirective } from '../src/checkbox-input';
import { RdxCheckboxRootDirective } from '../src/checkbox-root';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'checkbox-indeterminate-example',
    imports: [
        RdxLabelDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        LucideDynamicIcon,
        RdxCheckboxInputDirective,
        JsonPipe
    ],
    template: `
        <div class="flex items-center gap-3">
            <div
                [checked]="checked()"
                [indeterminate]="indeterminate()"
                (onCheckedChange)="checked.set($event.checked); indeterminate.set(false)"
                rdxCheckboxRoot
            >
                <button id="r1" [class]="c.button" rdxCheckboxButton>
                    <svg [class]="c.indicator" [lucideIcon]="iconName()" rdxCheckboxIndicator size="16" />
                </button>
                <input rdxCheckboxInput />
            </div>
            <label class="text-foreground flex items-center text-sm font-medium" rdxLabel htmlFor="r1">
                I'm a checkbox
            </label>
        </div>

        <section class="text-muted-foreground mt-3 text-sm">
            <p>checked:&nbsp;{{ checked() | json }}</p>
            <p>indeterminate:&nbsp;{{ indeterminate() | json }}</p>
        </section>

        <button [class]="cn(b.base, b.primary, b.size.md, 'mt-3')" (click)="toggleIndeterminate()" type="button">
            Toggle Indeterminate state
        </button>
    `
})
export class CheckboxIndeterminate {
    readonly checked = model<boolean>(false);
    readonly indeterminate = model<boolean>(false);

    // `checked` and `indeterminate` are orthogonal; the mixed state takes visual priority.
    readonly iconName = computed(() => (this.indeterminate() ? 'minus' : 'check'));

    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly c = demoCheckbox;

    toggleIndeterminate() {
        this.indeterminate.update((value) => !value);
    }
}
```
