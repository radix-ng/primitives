import { Component, computed, signal } from '@angular/core';
import {
    LucideChevronLeft as ChevronLeft,
    LucideChevronRight as ChevronRight,
    LucideDynamicIcon
} from '@lucide/angular';
import { RdxStepperModule } from '../index';

@Component({
    selector: 'StepperNavigation',
    imports: [RdxStepperModule, LucideDynamicIcon],
    host: {
        class: 'block w-full max-w-2xl'
    },
    template: `
        <div class="mx-auto w-full text-center">
            <div class="flex w-full items-center gap-2">
                <button
                    class="border-border bg-background text-foreground hover:bg-muted flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border shadow-sm focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
                    [disabled]="isFirstStep()"
                    (click)="prevStep()"
                    aria-label="Prev step"
                >
                    <svg class="flex" [lucideIcon]="ChevronLeft" size="16" strokeWidth="2" aria-hidden="true" />
                </button>

                <div class="flex min-w-0 flex-1 gap-1" [value]="currentStep()" rdxStepperRoot>
                    @for (item of steps; track $index) {
                        <div
                            class="group relative flex min-w-0 flex-1 flex-col items-center"
                            [step]="item"
                            rdxStepperItem
                        >
                            <button
                                class="flex w-full flex-col items-start gap-2 rounded-full focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)]"
                                rdxStepperTrigger
                            >
                                <div
                                    class="bg-border group-data-[state=inactive]:bg-muted group-data-[state=active]:bg-foreground group-data-[state=completed]:bg-primary h-1 w-full rounded"
                                    rdxStepperIndicator
                                >
                                    <span class="sr-only">{{ item }}</span>
                                </div>
                            </button>
                        </div>
                    }
                </div>

                <button
                    class="border-border bg-background text-foreground hover:bg-muted flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border shadow-sm focus-visible:[box-shadow:inset_0_0_0_2px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-50"
                    [disabled]="isLastStep()"
                    (click)="nextStep()"
                    aria-label="Next step"
                >
                    <svg class="flex" [lucideIcon]="ChevronRight" size="16" strokeWidth="2" aria-hidden="true" />
                </button>
            </div>

            <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Paginated stepper</p>
        </div>
    `
})
export class StepperNavigationComponent {
    steps = [1, 2, 3, 4];

    readonly currentStep = signal(2);

    isFirstStep = computed(() => this.currentStep() === 1);
    isLastStep = computed(() => this.currentStep() === this.steps.length);

    prevStep() {
        if (!this.isFirstStep()) {
            this.currentStep.set(this.currentStep() - 1);
        }
    }

    nextStep() {
        if (!this.isLastStep()) {
            this.currentStep.set(this.currentStep() + 1);
        }
    }

    protected readonly ChevronLeft = ChevronLeft;
    protected readonly ChevronRight = ChevronRight;
}
