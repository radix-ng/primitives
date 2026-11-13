// Compare actual isolation across native inert and aria-hidden; retain its raw spelling separately.
export function readItemDialogIsolation() {
    return ['popup', 'positioner', 'dialog-popup'].map((id) => {
        const element = document.querySelector(`[data-testid="${id}"]`);
        const roots = [];
        for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
            if (ancestor.hasAttribute('inert') || ancestor.hasAttribute('aria-hidden'))
                roots.push({
                    tag: ancestor.tagName,
                    id: ancestor.getAttribute('data-testid'),
                    inert: ancestor.hasAttribute('inert'),
                    ariaHidden: ancestor.getAttribute('aria-hidden')
                });
        }
        return { id, roots };
    });
}
