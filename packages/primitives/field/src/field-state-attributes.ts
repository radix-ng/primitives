export const fieldStateAttributes = {
    '[attr.data-invalid]': 'dataAttr(rootContext.validState() === false)',
    '[attr.data-valid]': 'dataAttr(rootContext.validState() === true)',
    '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())',
    '[attr.data-dirty]': 'dataAttr(rootContext.dirtyState())',
    '[attr.data-touched]': 'dataAttr(rootContext.touchedState())',
    '[attr.data-filled]': 'dataAttr(rootContext.filledState())',
    '[attr.data-focused]': 'dataAttr(rootContext.focusedState())'
};
