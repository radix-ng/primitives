// Native observations shared by Menu, Context Menu and Menubar. No framework state adapters.
export interface MenuChange<Layer extends string> {
    layer: Layer;
    open: boolean;
    reason: string;
    canceled: boolean;
    trigger: string | null;
}
export interface MenuValueChange {
    value: boolean | string;
    reason: string;
    canceled: boolean;
}
export interface MenuProbe<Config, Layer extends string> {
    framework: string;
    reference: { commit: string; packageVersion: string; digest: string };
    config: Config;
    changes: MenuChange<Layer>[];
    completions: Record<Layer, boolean[]>;
    nativeEvents: { layer: Layer; type: string; trusted: boolean }[];
    inputEvents: {
        type: string;
        trusted: boolean;
        timeStamp: number;
        pointerType?: string;
        key?: string;
        touches?: { id: number; x: number; y: number }[];
    }[];
    gestures: {
        type: string;
        timeStamp: number;
        trusted: boolean;
        button: number;
        buttons: number;
        clientX: number;
        clientY: number;
    }[];
    pointerMoves: {
        trusted: boolean;
        clientX: number;
        clientY: number;
        movementX: number;
        movementY: number;
        pointerType: string;
    }[];
    values: MenuValueChange[];
    selected: string[];
    activations: number;
}

export function createMenuProbe<Config, Layer extends string>(
    framework: string,
    reference: MenuProbe<Config, Layer>['reference'],
    settings: Config,
    layers: readonly Layer[]
) {
    const probe: MenuProbe<Config, Layer> = {
        framework,
        reference,
        config: settings,
        changes: [],
        completions: Object.fromEntries(layers.map((layer) => [layer, [] as boolean[]])) as Record<Layer, boolean[]>,
        nativeEvents: [],
        inputEvents: [],
        gestures: [],
        pointerMoves: [],
        values: [],
        selected: [],
        activations: 0
    };
    document.addEventListener(
        'pointermove',
        (event) =>
            probe.pointerMoves.push({
                trusted: event.isTrusted,
                clientX: event.clientX,
                clientY: event.clientY,
                movementX: event.movementX,
                movementY: event.movementY,
                pointerType: event.pointerType
            }),
        true
    );
    for (const type of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'contextmenu', 'click']) {
        document.addEventListener(
            type,
            (event) => {
                if (!(event instanceof MouseEvent)) return;
                probe.gestures.push({
                    type: event.type,
                    timeStamp: event.timeStamp,
                    trusted: event.isTrusted,
                    button: event.button,
                    buttons: event.buttons,
                    clientX: event.clientX,
                    clientY: event.clientY
                });
            },
            true
        );
    }
    for (const type of [
        'keydown',
        'keyup',
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel',
        'pointerdown',
        'pointerup',
        'pointercancel'
    ]) {
        document.addEventListener(
            type,
            (event) => {
                probe.inputEvents.push({
                    type: event.type,
                    trusted: event.isTrusted,
                    timeStamp: event.timeStamp,
                    ...('pointerType' in event ? { pointerType: (event as PointerEvent).pointerType } : {}),
                    ...('key' in event ? { key: (event as KeyboardEvent).key } : {}),
                    ...('touches' in event
                        ? {
                              touches: Array.from((event as TouchEvent).touches).map((touch) => ({
                                  id: touch.identifier,
                                  x: touch.clientX,
                                  y: touch.clientY
                              }))
                          }
                        : {})
                });
            },
            true
        );
    }
    return {
        probe,
        change(layer: Layer, open: boolean, reason: string, canceled: boolean, event: Event, trigger?: Element | null) {
            probe.changes.push({
                layer,
                open,
                reason,
                canceled,
                trigger: trigger?.getAttribute('data-testid') ?? null
            });
            probe.nativeEvents.push({ layer, type: event.type, trusted: event.isTrusted });
        },
        value(value: boolean | string, reason: string, canceled: boolean) {
            probe.values.push({ value, reason, canceled });
        },
        complete(layer: Layer, open: boolean) {
            probe.completions[layer].push(open);
        },
        select(id: string) {
            probe.selected.push(id);
        }
    };
}
