import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
    RdxSliderControl,
    RdxSliderIndicator,
    RdxSliderRoot,
    RdxSliderThumb,
    RdxSliderThumbInput,
    RdxSliderTrack,
    RdxSliderValueChangeEvent,
    RdxSliderValueCommitEvent
} from '@radix-ng/primitives/slider';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'slider-events-example',
    imports: [RdxSliderRoot, RdxSliderControl, RdxSliderTrack, RdxSliderIndicator, RdxSliderThumb, RdxSliderThumbInput],
    template: `
        <div class="grid w-80 gap-4">
            <div
                class="relative w-full select-none"
                [value]="value()"
                [step]="5"
                (onValueChange)="onValueChange($event)"
                (onValueCommitted)="onValueCommitted($event)"
                rdxSliderRoot
                name="volume"
            >
                <div class="flex h-5 w-full touch-none items-center" rdxSliderControl>
                    <div class="bg-muted relative h-1 w-full rounded-full" rdxSliderTrack>
                        <div class="bg-primary h-full rounded-full" rdxSliderIndicator></div>
                        <div
                            class="border-border bg-background focus-within:ring-ring block size-5 rounded-full border shadow-sm focus-within:ring-2"
                            rdxSliderThumb
                        >
                            <input rdxSliderThumbInput aria-label="Volume" />
                        </div>
                    </div>
                </div>
            </div>

            <label class="text-foreground flex items-center gap-2 text-sm">
                <input
                    class="accent-primary size-4"
                    [checked]="locked()"
                    (change)="locked.set($any($event.target).checked)"
                    type="checkbox"
                />
                Cancel value changes
            </label>

            <dl class="border-border bg-muted/40 grid gap-2 rounded-md border p-3 text-sm">
                <div class="flex justify-between gap-4">
                    <dt class="text-muted-foreground">Value</dt>
                    <dd class="text-foreground font-medium">{{ value() }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-muted-foreground">Change</dt>
                    <dd class="text-foreground text-right">{{ changeSummary() }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                    <dt class="text-muted-foreground">Commit</dt>
                    <dd class="text-foreground text-right">{{ commitSummary() }}</dd>
                </div>
            </dl>
        </div>
    `
})
export class SliderEventsExample {
    readonly value = signal(45);
    readonly locked = signal(false);
    readonly change = signal<RdxSliderValueChangeEvent | null>(null);
    readonly commit = signal<RdxSliderValueCommitEvent | null>(null);

    readonly changeSummary = computed(() => {
        const change = this.change();
        if (!change) {
            return 'none';
        }

        const details = change.eventDetails;
        return `${details.reason}, thumb ${details.activeThumbIndex}, canceled ${details.isCanceled()}`;
    });

    readonly commitSummary = computed(() => {
        const commit = this.commit();
        if (!commit) {
            return 'none';
        }

        return `${commit.eventDetails.reason}, value ${commit.value}`;
    });

    onValueChange(change: RdxSliderValueChangeEvent): void {
        if (this.locked()) {
            change.eventDetails.cancel();
        } else {
            this.value.set(change.value as number);
        }

        this.change.set(change);
    }

    onValueCommitted(commit: RdxSliderValueCommitEvent): void {
        this.commit.set(commit);
    }
}
