/** The naming sources used by this experiment: labelledby, aria-label, native labels, trigger text. */
export function accessibleName(element: HTMLElement): string {
    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
    const referenced = element
        .getAttribute('aria-labelledby')
        ?.trim()
        .split(/\s+/)
        .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
        .join(' ');
    if (referenced?.trim()) return normalize(referenced);
    const label = element.getAttribute('aria-label');
    if (label) return normalize(label);
    if ('labels' in element) {
        const labels = Array.from((element as HTMLInputElement).labels ?? [])
            .map((node) => node.textContent ?? '')
            .join(' ');
        if (labels.trim()) return normalize(labels);
    }
    // Comboboxes and dialogs require an authored name; their content/value is not their name.
    return element.tagName === 'BUTTON' && (!element.getAttribute('role') || element.getAttribute('role') === 'button')
        ? normalize(element.textContent ?? '')
        : '';
}
