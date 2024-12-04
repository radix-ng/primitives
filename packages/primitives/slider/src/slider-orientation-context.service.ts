import { Injectable, signal } from '@angular/core';

export interface OrientationContext {
    startEdge: string;
    endEdge: string;
    direction: number;
    size: string;
}

@Injectable()
export class RdxSliderOrientationContextService {
    private contextSignal = signal<OrientationContext>({
        startEdge: 'left',
        endEdge: 'right',
        direction: 1,
        size: 'width'
    });

    get context() {
        return this.contextSignal();
    }

    updateContext(context: Partial<OrientationContext>) {
        this.contextSignal.update((current) => ({
            ...current,
            ...context
        }));
    }
}
