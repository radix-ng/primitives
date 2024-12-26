import {
    DestroyRef,
    EnvironmentProviders,
    inject,
    Injectable,
    InjectionToken,
    isDevMode,
    makeEnvironmentProviders,
    NgZone,
    Provider,
    Renderer2,
    VERSION
} from '@angular/core';
import { injectDocument } from '@radix-ng/primitives/core';
import { RdxCdkEventServiceWindowKey } from './constants';
import { EventType, EventTypeAsPrimitiveConfigKey, PrimitiveConfig, PrimitiveConfigs } from './types';

function eventTypeAsPrimitiveConfigKey(eventType: EventType): EventTypeAsPrimitiveConfigKey {
    return `prevent${eventType[0].toUpperCase()}${eventType.slice(1)}` as EventTypeAsPrimitiveConfigKey;
}

@Injectable()
class RdxCdkEventService {
    document = injectDocument();
    destroyRef = inject(DestroyRef);
    ngZone = inject(NgZone);
    renderer2 = inject(Renderer2);

    primitiveConfigs?: PrimitiveConfigs;

    onDestroyCallbacks: Set<() => void> = new Set([deleteRdxCdkEventServiceWindowKey]);

    #clickDomRootEventCallbacks: Set<(event: MouseEvent) => void> = new Set();

    constructor() {
        this.#listenToClickDomRootEvent();
        this.#registerOnDestroyCallbacks();
    }

    registerPrimitive<T extends object>(primitiveInstance: T) {
        if (!this.primitiveConfigs) {
            this.primitiveConfigs = new Map();
        }
        if (!this.primitiveConfigs.has(primitiveInstance)) {
            this.primitiveConfigs.set(primitiveInstance, {});
        }
    }

    deregisterPrimitive<T extends object>(primitiveInstance: T) {
        if (this.primitiveConfigs?.has(primitiveInstance)) {
            this.primitiveConfigs.delete(primitiveInstance);
        }
    }

    preventPrimitiveFromCdkEvent<T extends object>(primitiveInstance: T, eventType: EventType) {
        this.#setPreventPrimitiveFromCdkEvent(primitiveInstance, eventType, true);
    }

    allowPrimitiveForCdkEvent<T extends object>(primitiveInstance: T, eventType: EventType) {
        this.#setPreventPrimitiveFromCdkEvent(primitiveInstance, eventType, false);
    }

    preventPrimitiveFromCdkMultiEvents<T extends object>(primitiveInstance: T, eventTypes: EventType[]) {
        eventTypes.forEach((eventType) => {
            this.#setPreventPrimitiveFromCdkEvent(primitiveInstance, eventType, true);
        });
    }

    allowPrimitiveForCdkMultiEvents<T extends object>(primitiveInstance: T, eventTypes: EventType[]) {
        eventTypes.forEach((eventType) => {
            this.#setPreventPrimitiveFromCdkEvent(primitiveInstance, eventType, false);
        });
    }

    setPreventPrimitiveFromCdkMixEvents<T extends object>(primitiveInstance: T, eventTypes: PrimitiveConfig) {
        Object.keys(eventTypes).forEach((eventType) => {
            this.#setPreventPrimitiveFromCdkEvent(
                primitiveInstance,
                eventType as EventType,
                eventTypes[eventTypeAsPrimitiveConfigKey(eventType as EventType)]
            );
        });
    }

    primitivePreventedFromCdkEvent<T extends object>(primitiveInstance: T, eventType: EventType) {
        return this.primitiveConfigs?.get(primitiveInstance)?.[eventTypeAsPrimitiveConfigKey(eventType)];
    }

    addClickDomRootEventCallback(callback: (event: MouseEvent) => void) {
        this.#clickDomRootEventCallbacks.add(callback);
    }

    removeClickDomRootEventCallback(callback: (event: MouseEvent) => void) {
        return this.#clickDomRootEventCallbacks.delete(callback);
    }

    #setPreventPrimitiveFromCdkEvent<
        T extends object,
        R extends EventType,
        K extends PrimitiveConfig[EventTypeAsPrimitiveConfigKey<R>]
    >(primitiveInstance: T, eventType: R, value: K) {
        if (!this.primitiveConfigs?.has(primitiveInstance)) {
            isDevMode() &&
                console.error(
                    '[RdxCdkEventService.preventPrimitiveFromCdkEvent] RDX Primitive instance has not been registered!',
                    primitiveInstance
                );
            return;
        }
        switch (eventType) {
            case 'cdkOverlayOutsideClick':
                this.primitiveConfigs.get(primitiveInstance)!.preventCdkOverlayOutsideClick = value;
                break;
            case 'cdkOverlayEscapeKeyDown':
                this.primitiveConfigs.get(primitiveInstance)!.preventCdkOverlayEscapeKeyDown = value;
                break;
        }
    }

    #registerOnDestroyCallbacks() {
        this.destroyRef.onDestroy(() => {
            this.onDestroyCallbacks.forEach((onDestroyCallback) => onDestroyCallback());
            this.onDestroyCallbacks.clear();
        });
    }

    #listenToClickDomRootEvent() {
        const target = this.document;
        const eventName = 'click';
        const options: boolean | AddEventListenerOptions | undefined = { capture: true };
        const callback = (event: MouseEvent) => {
            this.#clickDomRootEventCallbacks.forEach((clickDomRootEventCallback) => clickDomRootEventCallback(event));
        };

        const major = parseInt(VERSION.major);
        const minor = parseInt(VERSION.minor);

        let destroyClickDomRootEventListener!: () => void;
        /**
         * @see src/cdk/platform/features/backwards-compatibility.ts in @angular/cdk
         */
        if (major > 19 || (major === 19 && minor > 0) || (major === 0 && minor === 0)) {
            destroyClickDomRootEventListener = this.ngZone.runOutsideAngular(() => {
                const destroyClickDomRootEventListenerInternal = this.renderer2.listen(
                    target,
                    eventName,
                    callback,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    options
                );
                return () => {
                    destroyClickDomRootEventListenerInternal();
                    this.#clickDomRootEventCallbacks.clear();
                };
            });
        } else {
            /**
             * This part can get removed when v19.1 or higher is on the board
             */
            destroyClickDomRootEventListener = this.ngZone.runOutsideAngular(() => {
                target.addEventListener(eventName, callback, options);
                return () => {
                    this.ngZone.runOutsideAngular(() => target.removeEventListener(eventName, callback, options));
                    this.#clickDomRootEventCallbacks.clear();
                };
            });
        }
        this.onDestroyCallbacks.add(destroyClickDomRootEventListener);
    }
}

const RdxCdkEventServiceToken = new InjectionToken<RdxCdkEventService>('RdxCdkEventServiceToken');

const existsErrorMessage = 'RdxCdkEventService should be provided only once!';

const deleteRdxCdkEventServiceWindowKey = () => {
    delete (window as any)[RdxCdkEventServiceWindowKey];
};

const getProvider: (throwWhenExists?: boolean) => Provider = (throwWhenExists = true) => ({
    provide: RdxCdkEventServiceToken,
    useFactory: () => {
        isDevMode() && console.log('providing RdxCdkEventService...');
        if ((window as any)[RdxCdkEventServiceWindowKey]) {
            if (throwWhenExists) {
                throw Error(existsErrorMessage);
            } else {
                isDevMode() && console.warn(existsErrorMessage);
            }
        }
        (window as any)[RdxCdkEventServiceWindowKey] ??= new RdxCdkEventService();
        return (window as any)[RdxCdkEventServiceWindowKey];
    }
});

export const provideRdxCdkEventServiceInRoot: () => EnvironmentProviders = () =>
    makeEnvironmentProviders([getProvider()]);
export const provideRdxCdkEventService: () => Provider = () => getProvider(false);

export const injectRdxCdkEventService = () => inject(RdxCdkEventServiceToken, { optional: true });
