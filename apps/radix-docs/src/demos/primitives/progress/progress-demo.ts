import { Component, type OnDestroy, type OnInit } from '@angular/core';
import { RdxProgressIndicatorDirective, RdxProgressRootDirective } from '@radix-ng/primitives/progress';

@Component({
    selector: 'progress-demo',
    standalone: true,
    imports: [
        RdxProgressIndicatorDirective,
        RdxProgressRootDirective
    ],
    template: `
        <div class="ProgressRoot" [rdxValue]="progress" rdxProgressRoot>
            <div
                class="ProgressIndicator"
                [style.transform]="'translateX(-' + (100 - progress) + '%)'"
                rdxProgressIndicator
            ></div>
        </div>
    `,
    styleUrl: 'progress-demo.css'
})
export class ProgressDemoComponent implements OnInit, OnDestroy {
    progress = 10;
    intervalId!: any;

    ngOnInit() {
        this.intervalId = setInterval(() => {
            if (this.progress === 100) {
                this.progress = 10;
            } else {
                this.progress += 30;
            }
        }, 1000);
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}

export default ProgressDemoComponent;
