/** DOM node identity without a constructor from a particular Window (also safe during SSR). */
export function isNode(value: unknown): value is Node {
    return (
        !!value &&
        typeof value === 'object' &&
        typeof (value as Node).nodeType === 'number' &&
        typeof (value as Node).getRootNode === 'function'
    );
}

export function isElement(value: unknown): value is Element {
    return isNode(value) && value.nodeType === 1;
}

export function isHTMLElement(value: unknown): value is HTMLElement {
    return isElement(value) && value.namespaceURI === 'http://www.w3.org/1999/xhtml';
}

export function isShadowRoot(value: unknown): value is ShadowRoot {
    return isNode(value) && value.nodeType === 11 && 'host' in value && isElement(value.host);
}

/** Native event brands survive crossing a Window boundary, including events with a null view. */
export function isKeyboardEvent(event: unknown): event is KeyboardEvent {
    return Object.prototype.toString.call(event) === '[object KeyboardEvent]';
}

export function isMouseEvent(event: unknown): event is MouseEvent {
    return ['[object MouseEvent]', '[object PointerEvent]', '[object WheelEvent]', '[object DragEvent]'].includes(
        Object.prototype.toString.call(event)
    );
}
