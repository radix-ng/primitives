import { Component, computed, effect, signal } from '@angular/core';
import { RdxProgressIndicatorDirective, RdxProgressRootDirective } from '@radix-ng/primitives/progress';

@Component({
    selector: 'radix-progress-tailwind-demo',
    standalone: true,
    imports: [
        RdxProgressIndicatorDirective,
        RdxProgressRootDirective
    ],
    template: `
        <div
            class="relative h-2 w-[220px] overflow-hidden rounded-full bg-white sm:w-[280px] lg:w-[320px] dark:bg-stone-950"
            [value]="progress()"
            rdxProgressRoot
        >
            <div
                class="bg-primary h-full w-full flex-1 transition-all"
                [style.transform]="'translateX(-' + (100 - progress()) + '%)'"
                rdxProgressIndicator
            ></div>
        </div>
    `
})
export class ProgressDemoComponent {
    private startTime = Date.now();
    private readonly currentTime = signal(this.startTime);

    readonly progress = computed(() => {
        const elapsed = Math.floor((this.currentTime() - this.startTime) / 1000);
        const value = (10 + elapsed * 30) % 100;
        return value === 0 ? 10 : value;
    });

    #checkProgress = effect(() => {
        const intervalId = setInterval(() => {
            this.currentTime.set(Date.now());
        }, 1000);

        return () => clearInterval(intervalId);
    });
}

export default ProgressDemoComponent;
