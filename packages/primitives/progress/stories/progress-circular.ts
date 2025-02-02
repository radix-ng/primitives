import { Component, computed, effect, signal } from '@angular/core';
import { RdxProgressIndicatorDirective } from '../src/progress-indicator.directive';
import { RdxProgressRootDirective } from '../src/progress-root.directive';

@Component({
    selector: 'progress-circular',
    imports: [RdxProgressRootDirective, RdxProgressIndicatorDirective],
    template: `
        <div class="progress-container">
            <div [value]="progress()" rdxProgressRoot>
                <svg class="svg-full" viewBox="0 0 100 100">
                    <!-- Background circle -->
                    <path class="circle-track" [attr.d]="trackPath()" />
                    <!-- Progress circle -->
                    <path
                        class="circle-progress"
                        [attr.d]="trackPath()"
                        [style.stroke-linecap]="'round'"
                        [style.stroke-dasharray]="dashOffset() + 'px, ' + circumference + 'px'"
                        [style.stroke-dashoffset]="'0px'"
                        rdxProgressIndicator
                    />
                </svg>
                <div class="progress-center">
                    <span class="progress-text">{{ progress() }}%</span>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .progress-container {
                position: relative;
                width: 160px;
                height: 160px;
            }

            .svg-full {
                width: 100%;
                height: 100%;
            }

            .circle-track {
                fill: none;
                stroke: #e0e0e0;
                stroke-width: 6px;
            }

            .circle-progress {
                fill: none;
                stroke: black;
                stroke-width: 6px;
                transition:
                    stroke-dasharray 0.7s,
                    opacity 0.7s;
            }

            .progress-center {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .progress-text {
                font-size: 1.125rem;
                font-weight: bold;
                color: #333;
            }
        `

    ]
})
export class ProgressCircularComponent {
    private readonly RADIUS = 45;
    protected readonly circumference = 2 * Math.PI * this.RADIUS;

    progress = signal<number>(0);

    readonly dashOffset = computed(() => (this.progress() / 100) * this.circumference);

    trackPath = computed(() => {
        const r = this.RADIUS;
        return `
          M 50 50
          m 0 -${r}
          a ${r} ${r} 0 1 1 0 ${r * 2}
          a ${r} ${r} 0 1 1 0 -${r * 2}
          `;
    });

    constructor() {
        effect(() => {
            setInterval(() => {
                if (this.progress() < 100) {
                    this.progress.update((value) => value + 10);
                } else {
                    this.progress.set(0);
                }
            }, 1000);
        });
    }
}
