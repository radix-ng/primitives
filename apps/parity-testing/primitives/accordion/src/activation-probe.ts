import { installProbe, type Settings } from './contract';

interface ConsumerEvent {
    type: string;
    target: EventTarget | null;
    defaultPrevented: boolean;
    nativeEvent?: Event;
    preventDefault(): void;
    stopPropagation(): void;
}
interface EventRecord {
    source: string;
    type: string;
    key: string | null;
    repeat: boolean;
    target: string | null;
    prevented: boolean;
    trusted: boolean;
    detail: number | null;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}
export interface ActivationProbe {
    ready: boolean;
    consumers: EventRecord[];
    requests: EventRecord[];
    sequence: string[];
    submitters: (string | null)[];
    resets: number;
}
declare global {
    interface Window {
        accordionActivation: ActivationProbe;
    }
}

export function activationProbe(s: Settings, base = installProbe(s)) {
    const config = s.activation!;
    const observed: ActivationProbe = {
        ready: false,
        consumers: [],
        requests: [],
        sequence: [],
        submitters: [],
        resets: 0
    };
    window.accordionActivation = observed;
    const record = (source: string, event: ConsumerEvent | Event) => {
        const native = 'nativeEvent' in event && event.nativeEvent ? event.nativeEvent : (event as Event);
        const key = native as KeyboardEvent;
        return {
            source,
            type: event.type,
            key: key.key ?? null,
            repeat: key.repeat ?? false,
            target: (event.target as Element | null)?.getAttribute('data-testid') ?? null,
            prevented: event.defaultPrevented,
            trusted: native.isTrusted,
            detail: 'detail' in native ? (native as MouseEvent).detail : null,
            shift: key.shiftKey ?? false,
            ctrl: key.ctrlKey ?? false,
            alt: key.altKey ?? false,
            meta: key.metaKey ?? false
        };
    };
    const consume = (event: ConsumerEvent, source = 'host') => {
        if (source === 'host' && config.binding === 'native') return;
        if (event.type === config.event) {
            if (config.action === 'prevent' || config.action === 'pointer') event.preventDefault();
            if (config.action === 'stop') event.stopPropagation();
        }
        observed.consumers.push(record(source, event));
        observed.sequence.push(`${source}:${event.type}`);
    };
    return {
        consume,
        request(part: string, next: unknown, details: Parameters<typeof base.request>[2]) {
            const native = 'nativeEvent' in details.event ? details.event.nativeEvent : details.event;
            observed.requests.push(record(part, native));
            observed.sequence.push(part);
            return base.request(part, next, details);
        },
        ancestor(event: ConsumerEvent) {
            observed.sequence.push('ancestor:click');
            observed.consumers.push(record('ancestor', event));
        },
        submit(event: ConsumerEvent) {
            event.preventDefault();
            const native = 'nativeEvent' in event && event.nativeEvent ? event.nativeEvent : (event as SubmitEvent);
            observed.submitters.push((native as SubmitEvent).submitter?.getAttribute('data-testid') ?? null);
        },
        reset() {
            observed.resets++;
        },
        install(element: HTMLElement) {
            observed.ready = true;
            if (config.binding !== 'native') return () => undefined;
            const listener = (event: Event) => consume(event, 'native');
            const types = ['click', 'keydown', 'keyup', 'pointerdown', 'mousedown'];
            for (const type of types) element.addEventListener(type, listener);
            return () => {
                for (const type of types) element.removeEventListener(type, listener);
            };
        }
    };
}
