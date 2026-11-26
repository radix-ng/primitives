export const sliderPartStateAttributes = {
    '[attr.data-orientation]': 'root.orientation()',
    '[attr.data-disabled]': 'root.isDisabled() ? "" : undefined',
    '[attr.data-dragging]': 'root.dragging() ? "" : undefined',
    '[attr.data-valid]': 'root.fieldState().valid === true ? "" : undefined',
    '[attr.data-invalid]': 'root.fieldState().valid === false ? "" : undefined',
    '[attr.data-touched]': 'root.fieldState().touched ? "" : undefined',
    '[attr.data-dirty]': 'root.fieldState().dirty ? "" : undefined',
    '[attr.data-filled]': 'root.fieldState().filled ? "" : undefined',
    '[attr.data-focused]': 'root.fieldState().focused ? "" : undefined'
};
