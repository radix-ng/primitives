import { Component, computed, effect, signal } from '@angular/core';
import { RdxProgressIndicatorDirective, RdxProgressRootDirective } from '@radix-ng/primitives/progress';

@Component({
    selector: 'raidx-progress-demo',
    standalone: true,
    imports: [
        RdxProgressIndicatorDirective,
        RdxProgressRootDirective
    ],
    template: `
        <div class="ProgressRoot" [rdxValue]="progress()" rdxProgressRoot>
            <div
                class="ProgressIndicator"
                [style.transform]="'translateX(-' + (100 - progress()) + '%)'"
                rdxProgressIndicator
            ></div>
        </div>
    `,
    styleUrl: 'progress-demo.css'
})
export class ProgressDemoComponent {
    private startTime = Date.now();
    private readonly currentTime = signal(this.startTime);

    readonly progress = computed(() => {
        const elapsed = Math.floor((this.currentTime() - this.startTime) / 1000);
        const value = (10 + elapsed * 30) % 100;
        return value === 0 ? 10 : value;
    });

    constructor() {
        effect(() => {
            const intervalId = setInterval(() => {
                this.currentTime.set(Date.now());
            }, 1000);

            return () => clearInterval(intervalId);
        });
    }
}

export default ProgressDemoComponent;
