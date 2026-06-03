import { RdxAutocompleteAnchor } from './src/autocomplete-anchor';
import { RdxAutocompleteArrow } from './src/autocomplete-arrow';
import { RdxAutocompleteBackdrop } from './src/autocomplete-backdrop';
import { RdxAutocompleteClear } from './src/autocomplete-clear';
import { RdxAutocompleteEmpty } from './src/autocomplete-empty';
import { RdxAutocompleteGroup } from './src/autocomplete-group';
import { RdxAutocompleteGroupLabel } from './src/autocomplete-group-label';
import { RdxAutocompleteIcon } from './src/autocomplete-icon';
import { RdxAutocompleteInput } from './src/autocomplete-input';
import { RdxAutocompleteInputGroup } from './src/autocomplete-input-group';
import { RdxAutocompleteItem } from './src/autocomplete-item';
import { RdxAutocompleteItemIndicator } from './src/autocomplete-item-indicator';
import { RdxAutocompleteLabel } from './src/autocomplete-label';
import { RdxAutocompleteList } from './src/autocomplete-list';
import { RdxAutocompletePopup } from './src/autocomplete-popup';
import { RdxAutocompletePortal, RdxAutocompletePortalMisuseGuard } from './src/autocomplete-portal';
import { RdxAutocompletePositioner } from './src/autocomplete-positioner';
import { RdxAutocompleteRoot } from './src/autocomplete-root';
import { RdxAutocompleteRow } from './src/autocomplete-row';
import { RdxAutocompleteSeparator } from './src/autocomplete-separator';
import { RdxAutocompleteStatus } from './src/autocomplete-status';
import { RdxAutocompleteTrigger } from './src/autocomplete-trigger';
import { RdxAutocompleteValue } from './src/autocomplete-value';
import { NgModule } from '@angular/core';

export * from './src/autocomplete-anchor';
export * from './src/autocomplete-arrow';
export * from './src/autocomplete-backdrop';
export * from './src/autocomplete-clear';
export * from './src/autocomplete-empty';
export * from './src/autocomplete-group';
export * from './src/autocomplete-group-label';
export * from './src/autocomplete-icon';
export * from './src/autocomplete-input';
export * from './src/autocomplete-input-group';
export * from './src/autocomplete-item';
export * from './src/autocomplete-item-indicator';
export * from './src/autocomplete-label';
export * from './src/autocomplete-list';
export * from './src/autocomplete-popup';
export * from './src/autocomplete-portal';
export * from './src/autocomplete-positioner';
export * from './src/autocomplete-root';
export * from './src/autocomplete-row';
export * from './src/autocomplete-separator';
export * from './src/autocomplete-status';
export * from './src/autocomplete-trigger';
export * from './src/autocomplete-value';

export const _importsAutocomplete = [
    RdxAutocompleteRoot,
    RdxAutocompleteAnchor,
    RdxAutocompleteLabel,
    RdxAutocompleteInputGroup,
    RdxAutocompleteInput,
    RdxAutocompleteValue,
    RdxAutocompleteTrigger,
    RdxAutocompleteIcon,
    RdxAutocompleteClear,
    RdxAutocompletePortal,
    RdxAutocompletePortalMisuseGuard,
    RdxAutocompleteBackdrop,
    RdxAutocompletePositioner,
    RdxAutocompletePopup,
    RdxAutocompleteArrow,
    RdxAutocompleteList,
    RdxAutocompleteRow,
    RdxAutocompleteSeparator,
    RdxAutocompleteItem,
    RdxAutocompleteItemIndicator,
    RdxAutocompleteGroup,
    RdxAutocompleteGroupLabel,
    RdxAutocompleteEmpty,
    RdxAutocompleteStatus
];

@NgModule({
    imports: [..._importsAutocomplete],
    exports: [..._importsAutocomplete]
})
export class RdxAutocompleteModule {}
