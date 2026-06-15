/**
 * The deepest active element, descending into open shadow roots. Pass a specific `root`
 * (`Document` or `ShadowRoot`) to read focus in that document — defaults to the global `document`
 * (backward compatible). A focus scope passes its host's `ownerDocument` so it stays correct across
 * iframes / multi-document environments.
 */
export function getActiveElement(root: DocumentOrShadowRoot = document): Element | null {
    let activeElement = root.activeElement;
    if (activeElement == null) {
        return null;
    }

    while (
        activeElement != null &&
        activeElement.shadowRoot != null &&
        activeElement.shadowRoot.activeElement != null
    ) {
        activeElement = activeElement.shadowRoot.activeElement;
    }

    return activeElement;
}
