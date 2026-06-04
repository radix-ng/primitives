export type CheckedState = boolean | 'indeterminate';

export function isIndeterminate(checked?: CheckedState): checked is 'indeterminate' {
    return checked === 'indeterminate';
}

export function getCheckedState(checked: CheckedState): 'checked' | 'unchecked' | 'indeterminate' {
    return isIndeterminate(checked) ? 'indeterminate' : checked ? 'checked' : 'unchecked';
}
