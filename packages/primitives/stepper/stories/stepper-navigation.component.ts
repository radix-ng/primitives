import { Component, computed, signal } from '@angular/core';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { RdxStepperModule } from '../index';

@Component({
    selector: 'StepperNavigation',
    imports: [RdxStepperModule, LucideAngularModule],
    template: `
        <div class="StepperContainer">
            <div class="StepperNavigation">
                <button
                    class="StepperButton Button violet"
                    [disabled]="isFirstStep()"
                    (click)="prevStep()"
                    aria-label="Prev step"
                >
                    <lucide-angular
                        [img]="ChevronLeft"
                        size="16"
                        strokeWidth="2"
                        style="display: flex;"
                        aria-hidden="true"
                    />
                </button>

                <div class="Stepper" [value]="currentStep()" rdxStepperRoot>
                    @for (item of steps; track $index) {
                        <div class="StepperItem" [step]="item" rdxStepperItem>
                            <button class="StepperTrigger" rdxStepperTrigger>
                                <div class="StepperIndicator" rdxStepperIndicator>
                                    <span class="sr-only">{{ item }}</span>
                                </div>
                            </button>
                        </div>
                    }
                </div>

                <button
                    class="StepperButton Button violet"
                    [disabled]="isLastStep()"
                    (click)="nextStep()"
                    aria-label="Next step"
                >
                    <lucide-angular
                        [img]="ChevronRight"
                        style="display: flex;"
                        size="16"
                        strokeWidth="2"
                        aria-hidden="true"
                    />
                </button>
            </div>

            <p class="StepperPagination" role="region" aria-live="polite">Paginated stepper</p>
        </div>
    `,
    styles: `
        :host {
            button {
                all: unset;
            }
        }

        .StepperContainer {
            margin-left: auto;
            margin-right: auto;
            max-width: 40rem;
            text-align: center;
        }

        /* Контейнер шагов */
        .StepperNavigation {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .StepperButton {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2rem;
            border: none;
            background: transparent;
            cursor: pointer;
            border-radius: 4px;
        }

        .StepperButton:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .Stepper {
            display: flex;
            gap: 0.25rem;
            flex-grow: 1;
        }

        .StepperItem {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        .StepperTrigger {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            gap: 0.5rem;
        }

        .StepperTrigger:focus {
            outline: none;
            box-shadow: 0 0 0 2px var(--gray-2);
            border-radius: 9999px;
        }

        .StepperIndicator {
            width: 100%;
            height: 4px;
            background-color: var(--border);
            border-radius: 4px;
        }

        .StepperItem[data-state='inactive'] .StepperIndicator {
            background-color: rgba(0, 0, 0, 0.38);
        }

        .StepperItem[data-state='active'] .StepperIndicator {
            background-color: #000;
        }

        .StepperItem[data-state='completed'] .StepperIndicator {
            background-color: var(--green-9);
        }

        .StepperPagination {
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: var(--white-a10);
        }

        .Button.violet {
            background-color: white;
            color: var(--violet-11);
            box-shadow: 0 2px 10px var(--black-a7);
        }

        .Button.violet:hover {
            background-color: var(--mauve-3);
        }

        .Button.violet:focus {
            box-shadow: 0 0 0 2px black;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
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
