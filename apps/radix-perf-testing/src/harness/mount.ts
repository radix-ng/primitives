// Partially-compiled primitives fall back to JIT under createApplication() — load the compiler first
// (see docs/adr/0009 + radix-ssr-testing). This must be the first import the harness pulls in.
import '@angular/compiler';
import {
    afterEveryRender,
    ApplicationRef,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    provideZonelessChangeDetection,
    Type
} from '@angular/core';
import { createApplication } from '@angular/platform-browser';

/**
 * A freshly bootstrapped, zoneless application hosting a single standalone root component.
 * One of these is created and destroyed per benchmark iteration so nothing leaks between samples.
 */
export interface MountHandle<T> {
    readonly appRef: ApplicationRef;
    readonly componentRef: ComponentRef<T>;
    readonly instance: T;
    readonly host: HTMLElement;
    /** CD-cycle proxy: number of render passes since mount (afterRender fires once per pass). */
    renderCount(): number;
    /** Attach the component view to the app (untimed in callers that want to time only the tick). */
    attach(): void;
    /** Synchronous change detection + render. */
    tick(): void;
    destroy(): void;
}

/**
 * Create a host element, a zoneless application, and the root component — WITHOUT attaching/ticking
 * yet, so the caller controls exactly which work falls inside the timed window.
 */
export async function createMount<T>(component: Type<T>): Promise<MountHandle<T>> {
    const host = document.createElement('div');
    host.setAttribute('data-bench-host', '');
    document.body.appendChild(host);

    const appRef = await createApplication({
        providers: [provideZonelessChangeDetection()]
    });

    let renders = 0;
    // afterEveryRender runs once per render pass in the browser — our framework-native "renders"
    // proxy (the analog of base-ui's React.Profiler commit count).
    const renderHook = afterEveryRender(
        () => {
            renders += 1;
        },
        { injector: appRef.injector }
    );

    const componentRef = createComponent(component, {
        environmentInjector: appRef.injector as EnvironmentInjector,
        hostElement: host
    });

    return {
        appRef,
        componentRef,
        instance: componentRef.instance,
        host,
        renderCount: () => renders,
        attach: () => appRef.attachView(componentRef.hostView),
        tick: () => appRef.tick(),
        destroy: () => {
            renderHook.destroy();
            componentRef.destroy();
            appRef.destroy();
            host.remove();
        }
    };
}
