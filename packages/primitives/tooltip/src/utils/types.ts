export type EventType = 'cdkOverlayOutsideClick' | 'cdkOverlayEscapeKeyDown';
export type EventTypeCapitalized<R extends EventType = EventType> = Capitalize<R>;
export type EventTypeAsPrimitiveConfigKey<R extends EventType = EventType> = `prevent${EventTypeCapitalized<R>}`;
export type PrimitiveConfig = {
    [value in EventTypeAsPrimitiveConfigKey]?: boolean;
};
export type PrimitiveConfigs = Map<object, PrimitiveConfig>;
